<template lang="html">
  <div class="container padding-top-50 is-fluid">

    <error-box :error.sync="error" />

    <div class="columns">
      <div class="column is-3"></div>

      <div class="column is-6">
        <h2 class="title is-3">Register new user</h2>
        <hr />

        <div v-show="info" class="notification is-info level">
          <div><strong>Great:&nbsp;</strong>{{ info }}</div>
          <div class="level-right"><button class="level-item button is-success" @click="info = null; clearForm();">Register another user</button></div>
        </div>

        <validation-observer v-slot="{ handleSubmit }" ref="registerForm">
          <form v-show="!info" @submit.prevent="handleSubmit(submit)" >

            <div class="field is-horizontal">
              <div class="field-label is-normal"><label class="label">Email</label></div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <validation-provider name="Email" rules="required|email" v-slot="{ errors }">
                      <input v-model="email" class="input" type="text" placeholder="Email" autofocus :class="{'is-danger': errors[0] }" />
                      <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
                    </validation-provider>
                  </div>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal"><label class="label">First Name</label></div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <validation-provider name="First Name" rules="required|name" v-slot="{ errors }">
                      <input v-model="firstName" class="input" type="text" placeholder="First Name" :class="{'is-danger': errors[0] }" />
                      <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
                    </validation-provider>
                  </div>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal"><label class="label">Last Name</label></div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <validation-provider name="Last Name" rules="name" v-slot="{ errors }">
                      <input v-model="lastName" class="input" name="lastName" type="text" placeholder="Last Name" :class="{'is-danger': errors[0] }" />
                      <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
                    </validation-provider>
                  </div>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal"><label class="label">Password</label></div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <validation-provider name="Password" rules="required|password" v-slot="{ errors }">
                      <input v-model="password" class="input" type="password" placeholder="Password" :class="{'is-danger': errors[0] }" />
                      <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
                    </validation-provider>
                  </div>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal"><label class="label">Confirm&nbsp;Password</label></div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <validation-provider name="Password Confirmation" rules="required|password" v-slot="{ errors }">
                      <input v-model="password2" class="input" type="password" placeholder="Confirm Password" :class="{'is-danger': errors[0] }" />
                      <span v-if="errors" class="help is-danger">{{ errors[0] }}</span>
                    </validation-provider>
                  </div>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label"></div>
              <div class="field- control">
                <button class="button is-success" type="submit" :class="{ 'is-loading': isLoading }">Register</button>
                <button class="button is-warning" type="reset" @click="clearForm()">Clear</button>
              </div>
            </div>

          </form>
        </validation-observer>

      </div>

      <div class="column is-3"></div>
    </div>



  </div>

</template>

<script>
import ErrorBox from '../generic/ErrorBox.vue';
import InfoBox  from '../generic/InfoBox.vue';

export default {
    data() {
        return {
            error: null,
            info: null,

            email: '',
            firstName: '',
            lastName: '',
            password: '',
            password2: '',

            isLoading: false
        };
    },

    methods: {
        submit() {
            this.error = null; // remove any previously displayed errors
            this.isLoading = true; // set the is-loading class on the button

            if (this.password === this.password2) { // final check if the passwords are the same
                let credentials = {
                    email: this.email,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    password: this.password
                };
                this.auth.signup(this, credentials, '/verify');
            } else {
                this.error = "Password does not match.";
                this.isLoading = false;
            }
        },

        clearForm() {
            this.email = '';
            this.firstName = '';
            this.lastName = '';
            this.password = '';
            this.password2 = '';
            this.$refs.registerForm.reset();
        },

    },

    components: {
        'error-box': ErrorBox,
        'info-box': InfoBox,
    },

};
</script>

<style lang="css">

</style>
