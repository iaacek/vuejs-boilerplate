// import modules
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const passport = require('passport');
const ejwt = require('express-jwt'); // used to verify tokens as it sets the req.user with the decoded info for next middleware
const morgan = require('morgan');
//const moment = require('moment');
const momentTZ = require('moment-timezone');
const helmet = require('helmet');


// import my modules
const logger = require('./src/logger.js');
const auth = require('./src/auth.js');

// import config
const config = require('./config');

// variables
const jwtSecret = config.auth.jwtSecret;

// *** Express Config ***
// *** Middleware ***
app.use(helmet()); // Helmet is on

app.use(bodyParser.json({ limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));

app.use(passport.initialize());
app.disable('x-powered-by'); // OWASP recommendation, kind of redundant as helmet should be setting this anyway

// set global response headers for cors - manual, no cors package installed
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', config.app.allowOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Access-Control-Allow-Headers, Cache-Control, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
});

// check the jwt on all paths except for /auth - you have to list all of them explicitly - REGEX to sort it out
// also express-jwt sets user object in req with decoded jwt information
app.use(ejwt({ secret: jwtSecret }).unless({path: [ /^\/api\/v1\/auth\// ] }));

// Morgan - use custom timezone for the log file
morgan.token('date', (req, res, tz) => {
    return momentTZ().tz(tz.toString()).format('YYYY-MM-DDTHH:mm:ss.SSS');
});
// custom token to log userId and username of the requester
morgan.token('appUser', (req, res, tz) => {
    if (req.hasOwnProperty('user')) return req.user.user.userId + ':' + req.user.user.firstName;
    else return 'no-jwt';
});


// Morgan - custom output format
// :req[X-Real-IP] extra header added by NGINX on proxy_pass to API, that way we know the real ip of the computer where the request originated
morgan.format('myFormat', '[:date[' + config.timeZone +']] :remote-addr :req[X-Real-IP] :appUser :method :url HTTP/:http-version :status :res[content-length] :response-time ms');

app.use(morgan('myFormat', {
    skip: function (req, res) {
        return res.statusCode < 400
    }, stream: process.stderr
}));

app.use(morgan('myFormat', {
    skip: function (req, res) {
        return res.statusCode >= 400
    }, stream: process.stdout
}));


// *** Routes ***
// User login
router.post('/auth/login', auth.login); // login user into the system
router.post('/auth/register', auth.register); // register/create new user
router.get('/auth/verify/:id/:token', auth.verifyEmail); // verify email for new users
router.post('/auth/forgot', auth.forgot); // reset password for existing user - request
router.post('/auth/reset/:token', auth.reset); // rest pwd, check the token, expiry and set the new password + send email confirmation
router.get('/auth/hashTest', auth.hashTest); // hash speed test - DISABLE FOR PRODUCTION

// admin only route
// router.post('/admin/users', auth.checkRole('systemRole', 'admin'), users.users); // just a sample

// *** Server Init ***
app.use('/api/v1', router);

app.listen(config.app.port, function() {
	logger.info('Express.js API listening on port ' + config.app.port + ' (' + config.env + ')');
});