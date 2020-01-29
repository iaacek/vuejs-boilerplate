/* Authentication module

 */

// npm packages
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // used to create and sign tokens
const sql = require('mssql');
const randomstring = require("randomstring");
const moment = require("moment");

// my packages
const config = require('../config.js');
const db = require('./db.js');
const mail = require('./mail.js');
const logger = require('./logger.js');


// constants and variables
const secret = config.auth.jwtSecret;
const saltRounds = 13;

//passport config
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async function(username, password, done) {

        // this will only get executed if username AND password is provided, otherwise 'false' is returned by passport
        // before reaching this comment

        try {
            let result = await db.request()
                .input('email', sql.VarChar, username)
                .query("SELECT * FROM SystemUsers WHERE email = @email");

            let user = result.recordset[0];

            if (!user) {
                logger.warn('- attempt failed');
                return done("Incorrect credentials.", false);
            } else {
                if (user.email == null) {
                    return done("Incorrect credentials.", false);
                }
                if (user.systemRole === 'disabled') {
                    return done("Account disabled", false);
                }
                if (user.isEmailVerified === null || user.isEmailVerified === false) {
                    return done("Please verify your email first. Check your inbox for our verification email.", false);
                }

                bcrypt.compare(password, user.password, function (err, res) {
                    if (res === true) {
                        return done(null, user);
                    } else {
                        logger.warn('Failed login attempt for user: ' + username);
                        return done("Incorrect credentials..", false);
                    }
                });
            }
        } catch (err) {
            logger.error(err);
            return done("Incorrect credentials...", false);
        } finally {}
    }

));


// ONLY USED WITH PASSPORT SESSIONS ENABLED
// used to serialize the user for the session - not used if //app.use(passport.session()) is not executed
passport.serializeUser(function(user, done) {
    logger.warn('serialize user executed');
});

// used to deserialize the user - not used if //app.use(passport.session()) is not executed
passport.deserializeUser(async function(id, done) {
    logger.warn('deserialize user executed');
});


// middleware - Authorization function - custom made, to be used after express-jwt as it sets the req.user
// after decoding the jwt.
const checkRole = function(roleType, role) {
    return function(req, res, next) {
        let userRole;

        switch(roleType) {
            case 'systemRole':
                userRole = req.user.user.systemRole;
                break;
            default:
                return res.status(403).json({ success: false, error: 'Unknown role type - user not authorized' });
        }

        switch(role) {
            case 'user':
                if (userRole === 'user' || userRole === 'poweruser' || userRole === 'admin') next();
                else return res.status(403).json({ success: false, error: 'User not authorized' });
                break;
            case 'poweruser':
                if (userRole === 'poweruser' || userRole === 'admin') next();
                else return res.status(403).json({ success: false, error: 'User not authorized' });
                break;
            case 'admin':
                if (userRole === 'admin') next();
                else return res.status(403).json({ success: false, error: 'User not authorized' });
                break;
            default:
                return res.status(403).json({ success: false, error: 'User not authorized' });
        }
    }
};

// functions
const login = function(req, res, next) {
    passport.authenticate('local', function(err, userInfo, info) {
        if (err) {
            return res.status(401).json({ error: err });
        }
        if (!userInfo) {
            return res.status(401).json({ error: { email: 'Incorrect credentials, try again=)', password: 'Really?' }});
        } else {
            //user has authenticated correctly thus we create a JWT token
            let user = {
                userId: userInfo.userId,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                systemRole: userInfo.systemRole,
            };

            let token = jwt.sign({user}, secret, { expiresIn: "1h" });

            logger.info('- logged in as ' + userInfo.email + ', system role: ' + user.systemRole);
            return res.status(200).json({ success: true, systemRole: user.systemRole, token: token });
        }
    })(req, res, next);
};

const register = async function (req, res) {
    // check the input values first
    if (!req.body.email) return res.status(422).json({success: false, error: 'Invalid email'});
    if (!req.body.firstName) return res.status(422).json({success: false, error: 'Invalid first name'});
    if (!req.body.password) return res.status(422).json({success: false, error: 'Invalid password'});

    // random string for the verify token
    let ranString = randomstring.generate({
        length: 12,
        charset: 'alphabetic'
    });

    // TODO: sanitize input data
    const data = {
        email: req.body.email.trim(),
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        password: await bcrypt.hash(req.body.password, saltRounds),
        verifyToken: ranString,
        role: 'user'
    };

    try {
        // SQL Query > Select Data To Check If Email Already Exists
        const result = await db.request()
            .input('email', sql.VarChar, data.email)
            .query("SELECT * FROM SystemUsers WHERE email = @email ORDER BY userId ASC");
        const user = result.recordset[0];

        if (user) { // user exists, return an error
            return res.status(400).json({success: false, error: 'User already exists. Please try again.'});
        } else { // user doesn't exist, continue and save it in the db

            // SQL Query > Insert Data
            const insertRes = await db.request()
                .input('email', sql.VarChar, data.email)
                .input('password', sql.VarChar, data.password)
                .input('firstName', sql.VarChar, data.firstName)
                .input('lastName', sql.VarChar, data.lastName)
                .input('verifyToken', sql.VarChar, data.verifyToken)
                .input('systemRole', sql.VarChar, data.role)
                .query("INSERT INTO SystemUsers(email, password, firstName, lastName, verifyToken, systemRole) " +
                    "OUTPUT INSERTED.userId, INSERTED.email, INSERTED.firstName, INSERTED.lastName, INSERTED.isEmailVerified, INSERTED.systemRole " +
                    "VALUES(@email, @password, @firstName, @lastName, @verifyToken, @systemRole)");

            // send email about the user being added
            let text = 'Hi ' + data.firstName + ",\n\n Welcome to Vue.js sample app. Please click the following link to verify your email - "
                + req.headers.origin + '/verify/' + insertRes.recordset[0].userId + '/' + ranString + '';
            let mailOptions = {
                from: 'sample-app@vuejs.com',      // sender address
                to: data.email,             // list of receivers
                subject: 'Vue.js Sample app - ' + data.email + ' Email Verification', // Subject line
                text: text // plaintext body

            };
            mail.transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    logger.error(error);
                    return res.status(200).json({success: false, error: "User created but could not send email to specified domain.", user: insertRes.recordset[0]});
                } else {
                    logger.info('Email Message sent: ' + info.response);
                    return res.status(200).json({success: true, message: "User registered, verification email sent...", user: insertRes.recordset[0] });
                }
            });
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).json({success: false, error: err});
    }
};

const verifyEmail = async function(req, res) {
    let id = req.params.id;
    let token = req.params.token;

    try {
        let result = await db.request()
            .input('userId', sql.Int, id)
            .query('SELECT * FROM SystemUsers WHERE userId = @userId');
        let user = result.recordset[0];
        if (!user) {
            return res.json({ success: false, error: 'ERROR: User does not exist...' });
        } else {
            if (user.verifyToken === token) {
                await db.request()
                    .input('userId', sql.Int, id)
                    .query('UPDATE SystemUsers SET isEmailVerified = 1 WHERE userId = @userId');
                return res.status(200).json({ success: true, message: 'Email is now verified. Please login to get started!' });
            } else {
                return res.status(400).json({ success: false, error: 'Email NOT verified. Invalid token' });
            }
        }
    } catch(err) {
        logger.error(err);
        return res.status(500).json({ success: false, error: 'ERROR: User does not exist or something went wrong.' });
    }
};

const forgot = async function(req, res) {

    let email = req.body.email;
    let expiryDate = moment().add(2, 'hours').toDate();
    let token = randomstring.generate({
        length: 16,
        charset: 'alphabetic'
    });

    try {
        let result = await db.request()
            .input('email', sql.VarChar, email)
            .query("SELECT * FROM SystemUsers WHERE email = @email");
        let user = result.recordset[0];
        if (!user) {
            return res.status(400).json({error: 'Email does not match to any account.'}); // should this info be exposed
        } else {

            let updateResult = await db.request()
                .input('token', sql.VarChar, token)
                .input('expiryDate', sql.DateTime, expiryDate)
                .input('email', sql.VarChar, email)
                .query('UPDATE SystemUsers SET resetPwdToken = @token, resetPwdExpiry = @expiryDate WHERE email= @email');

            let status = updateResult.rowsAffected[0];

            if (status === 1) {
                let mailOptions = {
                    from: 'sample-app@vuejs.com', // sender address
                    to: email, // list of receivers
                    subject: 'Vue.js Sample app - ' + email + ' Password Reset', // Subject line
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    req.headers.origin + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                mail.transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        logger.error('Error!!');
                        return res.status(400).json({error: error});
                    } else {
                        logger.info('Password forgot processed for user: ' + email);
                        logger.info('Email Message sent: ' + info.response);
                        return res.status(200).json({success: true, message: "Password reset email sent."});
                    }
                });
            } else {
                return res.status(500).json({success: false, message: "Error while requesting a password reset"});
            }
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).json({success: false, data: err});
    }
};

const reset = async function(req, res) {
    let password = await bcrypt.hash(req.body.password, saltRounds);
    let token = req.params.token;

    try {
        let result = await db.request()
            .input('token', sql.VarChar, token)
            .query('SELECT * FROM SystemUsers WHERE resetPwdToken = @token');
        let user = result.recordset[0];
        if (!user) {
            return res.status(400).json({ error: 'Invalid password reset request - token expired' });
        } else {

            let updateResult = await db.request()
                .input('password', sql.VarChar, password)
                .input('email', sql.VarChar, user.email)
                .query('UPDATE SystemUsers SET password = @password, resetPwdToken = null, resetPwdExpiry = null WHERE email = @email');
            let status = updateResult.rowsAffected[0];

            if (status === 1) {
                let mailOptions = {
                    from: 'sample-app@vuejs.com', // sender address
                    to: user.email, // list of receivers
                    subject: 'Vue.js Sample app - Your Password Has Been Changed', // Subject line
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                mail.transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        logger.error(error);
                        return res.status(500).json({error: 'Password was reset but confirmation email failed to be delivered. Proceed to login with the new password.'});
                    } else {
                        logger.info('Password reset for user: ' + user.email);
                        logger.info('Email Message sent: ' + info.response);
                        return res.status(200).json({success: true, message: "Password reset successful."});
                    }
                });
            } else {
                return res.status(500).json({success: false, message: "Password was not updated"});
            }
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ success: false, data: err });
    }
};

const hashTest = async function(req, res) {

    logger.warn(JSON.stringify(req.headers));

    const start = Date.now();
    await bcrypt.hash('test', saltRounds);
    const end = Date.now();
    const result = end - start;
    logger.info('hash duration: ' + result);
    return res.status(200).json({success: true, message: result });
};


module.exports = {
    //secret,
    checkRole,
    login,
    register,
    verifyEmail,
    forgot,
    reset,
    hashTest
};
