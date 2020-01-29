<template lang="html">
  <div class="container padding-top-50" id="loginForm">

    <error-box :error.sync="error" />

    <h2 class="title is-3">Login</h2>
    <hr />

    <validation-observer v-slot="{ handleSubmit }">
      <form @submit.prevent="handleSubmit(login)">

        <div class="field">
          <label class="label">Email</label>
          <p class="control has-icons-left">
            <validation-provider name="Email" rules="required|email" v-slot="{ errors }">
              <input v-model="email" class="input" type="text" placeholder="Email" :class="{'is-danger': errors[0] }"/>
              <span class="icon is-small is-left"><i class="fas fa-envelope" /></span>
              <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
            </validation-provider>
          </p>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <p class="control has-icons-left">
            <validation-provider name="Password" rules="required|password" v-slot="{ errors }">
              <input v-model="password" class="input" type="password" placeholder="Password" :class="{'is-danger': errors[0] }" />
              <span class="icon is-small is-left"><i class="fas fa-unlock-alt" /></span>
              <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
            </validation-provider>
          </p>
        </div>

        <div class="field">
          <p class="control">
            <button type="submit" class="button is-success" :class="{ 'is-loading': isLoading }">Login</button>
            <router-link to="/forgotPassword" class="button is-link" >Forgot your password?</router-link>
          </p>
        </div>

      </form>
    </validation-observer>

  </div>

</template>

<script>

import ErrorBox from '../generic/ErrorBox.vue';

export default {
    props: {
        err: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            error: null,
            email: '',
            password: '',

            isLoading: false // auth.login is resetting is-loading when an error occurs through context
        };
    },


    methods: {
        login() { // with automatic handleSubmit validation: can't pass parameters but less code to write.
            this.isLoading = true; // set the is-loading class on the button
            let credentials = {
                email: this.email,
                password: this.password
            };
            this.auth.login(this, credentials, this.$route.query.redirect); // submit the login
        },

        login2() {
            // option one with validation in the login method - will allow passing of parameters in login function
            // you have to add ref to validationObserver with value 'loginForm'
            this.$refs.loginForm.validate().then(success => {
                if (!success) { // checks unsuccessful
                    return;
                }

                this.isLoading = true; // set the is-loading class on the button, it will be unset by this.auth.login function via context
                let credentials = {
                    email: this.email,
                    password: this.password
                };
                this.auth.login(this, credentials, this.$route.query.redirect); // submit the login
            });
        },
    },

    // when the jwt expires and you have to re-login, I am passing the err.
    mounted() {
        if (this.err !== null) {
            console.log('Relog error: ' + this.err);
            this.error = this.err;
        }
    },

    components: {
        'error-box': ErrorBox
    },

};
</script>

<style lang="css">
  #loginForm {
    width: 33%;
  }
</style>
