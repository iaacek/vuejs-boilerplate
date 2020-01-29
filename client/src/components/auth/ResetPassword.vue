<template>
  <div class="container padding-top-50" id="resetPasswordForm">

    <error-box :error.sync="error" />
    <info-box :info.sync="info" link="/login" link-label="Login" />

    <div v-if="!pwdReset">
      <h2 class="title is-3">Reset password</h2>
      <hr />

      <validation-observer v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(submit)" >

          <div class="field">
            <label class="label">Password</label>
            <p class="control">
              <validation-provider name="Password" rules="required|password" v-slot="{ errors }">
                <input v-model="password" class="input" type="password" placeholder="Password" :class="{'is-danger': errors[0] }" />
                <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
              </validation-provider>
            </p>
          </div>

          <div class="field">
            <label class="label">Password Confirmation</label>
            <p class="control">
              <validation-provider name="Password Confirmation" rules="required|password" v-slot="{ errors }">
                <input v-model="password2" class="input" type="password" placeholder="Confirm Password" :class="{'is-danger': errors[0] }" />
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

	</div>
</template>

<script>

import ErrorBox from '../generic/ErrorBox.vue';
import InfoBox from '../generic/InfoBox.vue';

export default {
    name: 'ResetPassword',
    data () {
        return {
            error: null,
            info: null,
            password: '',
            password2: '',
            isResetting: false,
            pwdReset: false,
        };
    },
    computed: {},
    methods: {
        submit() {
            this.isResetting = true; // set the is-loading class on the button

            if (this.password === this.password2) { // final check if the passwords are the same
                let credentials = {
                    password: this.password,
                    token: this.$route.params.token
                };
                this.auth.reset(this, credentials, '/');
            } else {
                this.error = "Password does not match.";
                this.isResetting = false;
            }

        },
        clearForm() {
            this.password = '';
            this.password2 = '';
            this.isResetting = false;
            this.error = null;
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
  #resetPasswordForm {
    width: 33%;
  }
</style>
