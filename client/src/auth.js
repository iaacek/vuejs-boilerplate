import * as tinyCookie from 'tiny-cookie'; // doesn't have default export, breaking change in 2.0
import jsonwebtoken    from 'jsonwebtoken';
import axios           from 'axios';

export default {
    user: {
        JWToken: '',
        authenticated: false,
        systemRole: '',
        name: ''
    },
    login(context, creds, redirect) {
        axios.post('auth/login', {email: creds.email, password: creds.password})
            .then(response => {

                tinyCookie.set('jwt', response.data.token);
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + tinyCookie.get('jwt');

                // submitted in the body response along with the token
                this.user.JWToken = response.data.token;
                this.user.authenticated = true;
                this.user.systemRole = response.data.systemRole;

                // get also first name and last name - only part of the token
                let jwtDecoded = jsonwebtoken.decode(this.user.JWToken);
                let lastName = (jwtDecoded.user.lastName !== null) ? jwtDecoded.user.lastName : '';
                this.user.name = jwtDecoded.user.firstName + ' ' + lastName;

                // if jwt expires, user has to relog but redirect is passed along so he goes to where he was before
                if (redirect) context.$router.push(redirect);
                else context.$router.push('/');

            })
            .catch(error => {
                context.isLoading = false; // disable the is-loading class on the login submit button when there is an error, any kind
                if (error.message === 'Network Error') {  // we got an network error - server is down?
                    context.error = 'Server is down - contact site admin.';
                } else {                // we got error from the server
                    context.error = error.response.data.error;
                }
            });
    },

    signup(context, creds, redirect) {
        axios.post('auth/register', {
            email: creds.email,
            firstName: creds.firstName,
            lastName: creds.lastName,
            password: creds.password
        })
            .then(response => {
                context.isLoading = false;
                context.info = response.data.message;
                context.clearForm();

            })
            .catch(error => {
                context.isLoading = false; // disable the is-loading class on the create user button when there is an error, any kind
                if (error.message === 'Network Error') {  // we got an network error - server is down?
                    context.error = 'Server is down - contact site admin.';
                } else {                // we got error from the server
                    context.error = error.response.data.error;
                }
            });
    },

    forgot(context, creds, redirect) {
        axios.post('auth/forgot', {email: creds.email})
            .then(response => {
                if (response.data.success === true) {
                    context.info = response.data.message;
                    context.isResetting = false;
                    context.clearForm();
                }
            })
            .catch(error => {
                context.isResetting = false; // disable the is-loading class on the reset password button when there is an error, any kind
                if (error.message === 'Network Error') {  // we got an network error - server is down?
                    context.error = 'Server is down - contact site admin.';
                } else {                // we got error from the server
                    context.error = error.response.data.error;
                }
            });
    },

    reset(context, creds, redirect) {
        axios.post('auth/reset/' + creds.token + '', {password: creds.password})
            .then(response => {
                context.info = response.data.message;
                context.isResetting = false;
                context.clearForm();
            })
            .catch(error => {
                context.isResetting = false; // disable the is-loading class on the reset password button when there is an error, any kind
                if (error.message === 'Network Error') {  // we got an network error - server is down?
                    context.error = 'Server is down - contact site admin.';
                } else {                // we got error from the server
                    context.error = error.response.data.error;
                }
            });
    },

    logout(context) {
        this.clearAuthInfo();
        context.$router.push('/login');
    },

    clearAuthInfo() {
        tinyCookie.remove('jwt');
        this.user.authenticated = false;
    },

    checkAuth() {
        let jwt = tinyCookie.get('jwt');

        if (jwt) {
            this.user.authenticated = true;
            this.user.JWToken = jwt;

            let jwtDecoded = jsonwebtoken.decode(jwt);

            this.user.systemRole = jwtDecoded.user.systemRole;
            let lastName = (jwtDecoded.user.lastName !== null) ? jwtDecoded.user.lastName : '';
            this.user.name = jwtDecoded.user.firstName + ' ' + lastName;
        } else {
            this.user.authenticated = false;
        }
    },

    checkRole(roleType, role) {
        let userRole;

        switch (roleType) { // only one case here but you can add more role types
            case 'systemRole':
                userRole = this.user.systemRole;
                break;
            // add a case for more role types
            default:
                return false;
        }

        switch (role) {
            case 'user':
                return userRole === 'user' || userRole === 'poweruser' || userRole === 'admin';
            case 'poweruser':
                return userRole === 'poweruser' || userRole === 'admin';
            case 'admin':
                return userRole === 'admin';
            default:
                return false;
        }
    },
}
