// environment: this is based on the mode in webpack configs
const env = process.env.NODE_ENV;

// Import packages
import Vue                                      from 'vue';
import Router                                   from 'vue-router';
import axios                                    from 'axios';
import moment                                   from 'moment';
import {ValidationProvider, ValidationObserver} from 'vee-validate';
import App                                      from './App.vue';
import jsonwebtoken                             from 'jsonwebtoken';
import * as tinyCookie                          from 'tiny-cookie'; // doesn't have default export, breaking change in 2.0


// Import custom js packages
import auth            from './auth';
import router          from './router.js';
import validationRules from './validation.js'; // import all the validation rules, do not remove this line

// Set globals
axios.defaults.baseURL = (env === 'development') ? 'http://localhost:3000/api/v1' : 'https://<prod_server>/api/v1';
axios.defaults.headers.common['Authorization'] = 'Bearer ' + tinyCookie.get('jwt');
axios.defaults.headers.common['Cache-Control'] = 'no-cache';

// intercept all axios requests to check the expiration time, force login if expired
axios.interceptors.request.use((config) => {
    if (tinyCookie.get('jwt') !== null) {
        let jwtExpiration = jsonwebtoken.decode(tinyCookie.get('jwt')).exp;
        let currentTime = Date.now() / 1000;
        if (jwtExpiration < currentTime) {
            auth.clearAuthInfo();
            router.push(
                {
                    name: 'login',
                    params: {err: 'Your session has expired. Please log in again...'},
                }
            );
            return;
        }
    }
    // everything is alright, no token yet or it's not expired
    return config;

});


// decide on approach for importing modules: Vue.prototype vs import in every .vue file
Vue.prototype.axios = axios;
Vue.prototype.auth = auth;
Vue.prototype.moment = moment;


// Auth Setup
// Check the user's auth status when the app starts
auth.checkAuth();
Vue.use(Router);

// Register components globally - Vue.component('<desired-html-tag>', <component_name>);
Vue.component('validation-provider', ValidationProvider);
Vue.component('validation-observer', ValidationObserver);

// Routes - moved to routes.js

// Vue directives

// Build app into #app div
new Vue({

    el: '#app',
    router: router,
    //.$mount('#app'); $mount is only needed if el: hasn't been specified. vue instance is in unmounted state (no element to
    // attach it to) and that's when $mount comes to play.

    render: (h) => h(App),
});
