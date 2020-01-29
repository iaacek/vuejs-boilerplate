import auth            from './auth';
import jsonwebtoken    from 'jsonwebtoken';
import Router          from 'vue-router';
import * as tinyCookie from 'tiny-cookie'; // doesn't have default export, breaking change in 2.0

// Import components
import NotFound from './components/generic/NotFound.vue'
import Welcome  from './components/generic/Welcome.vue'

import Register from './components/auth/Register.vue'

import Login          from './components/auth/Login.vue'
import Verify         from './components/auth/Verify.vue'
import ForgotPassword from './components/auth/ForgotPassword.vue'
import ResetPassword  from './components/auth/ResetPassword.vue'


// Routes
let router = new Router({
    mode: 'history',
    routes: [
        {path: '/notFound', component: NotFound},
        {path: '/', component: Welcome},
        // login
        {path: '/register', component: Register, meta: {noAuth: true}},
        {name: 'login', path: '/login', component: Login, props: true, meta: {noAuth: true}},
        {path: '/forgotPassword', component: ForgotPassword},
        {path: '/reset/:token', component: ResetPassword},
        {path: '/verify/:id/:token', component: Verify},
    ],
});

// Protect authenticated routes with Route Meta tags.
router.beforeEach((to, from, next) => {
    // check if the page exists, if no: go to notFound page
    if (!to.matched.length) {
        next('/notFound');
    } else {
        next();
    }

    /* check if there is a cookie with jwt.
     If there is one, decode it, find out that the current time is and compare them.
     If the jwt is expired, clear the auth info (set auth to false and delete the cookie)
     and redirect the user to the login page.
     */
    if (tinyCookie.get('jwt')) {
        let jwtExpiration = jsonwebtoken.decode(tinyCookie.get('jwt')).exp;
        let currentTime = Date.now() / 1000;
        if (jwtExpiration < currentTime) {
            auth.clearAuthInfo();
            next({
                path: '/login',
                query: {redirect: to.fullPath}
            })
        }
    }

    // for routes that require user to be logged in. If the user is not logged in, redirect to /login and then back
    // to the requested page
    if (to.matched.some(record => record.meta.auth)) {
        if (!auth.user.authenticated) {
            if (to.path !== '/login') { // IMPORTANT: to prevent calling next('login') when already going to /login
                next({
                    path: '/login',
                    query: {redirect: to.fullPath}
                })
            }
        } else {
            next()
        }
    }

    // for routes that should not be available to logged users (/login, /register, etc)
    if (to.matched.some(record => record.meta.noAuth)) {
        if (auth.user.authenticated) {
            next({
                path: '/',
            })
        } else {
            next()
        }
    }

    next() // always call next() last - if no condition applies, we are moving on...

});

export default router;
