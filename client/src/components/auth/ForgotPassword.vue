<template>
	<div class="container padding-top-50" id="forgotPasswordForm">

    <error-box :error.sync="error" />
    <info-box :info.sync="info" />

    <div v-if="!pwdReset">
      <h2 class="title is-3">Forgot your password?</h2>
      <hr />

      <validation-observer v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(submit)">

          <div class="field">
            <label class="label">Email</label>
            <p class="control">
              <validation-provider name="Email" rules="required|email" v-slot="{ errors }">
                <input v-model="email" class="input" name="email" type="text" placeholder="Email" :class="{'is-danger': errors[0] }" />
                <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
              </validation-provider>
            </p>
          </div>

          <div class="field">
            <p class="control">
              <button class="button is-success" type="submit" :class="{ 'is-loading': isResetting }">Reset password</button>
            </p>
          </div>

        </form>
      </validation-observer>
    </div>

    <div v-else>
      <p class="has-text-centered title is-4">Please check your email Inbox and follow the link there...</p>
    </div>

  </div>
</template>

<script>

import ErrorBox from '../generic/ErrorBox.vue';
import InfoBox from '../generic/InfoBox.vue';

export default {
    name: 'ForgotPassword',
    data() {
        return {
            error: null,
            info: null,

            email: '',

            isResetting: false,
            pwdReset: false
        };
    },
    methods: {
        submit() {
            this.isResetting = true; // set the is-loading class on the button
            let credentials = {
                email: this.email,
            };
            this.auth.forgot(this, credentials, '/'); // submit the login
        },

        clearForm() {
            this.error = null;
            this.isResetting = false;
            this.email = '';
            this.pwdReset = true;
        }
    },

    components: {
        'error-box': ErrorBox,
        'info-box': InfoBox
    }

};
</script>

<style lang="css">
  #forgotPasswordForm {
    width: 33%;
  }
</style>
