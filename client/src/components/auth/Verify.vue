
<template lang="html">
  <div class="container padding-top-50">
    <h2 class="title is-2">Email Verification</h2>
    <hr>
    <p>
      {{this.response}}
    </p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      response: ''
    }
  },
  created () {
    console.log('jop');

    if (this.$route.params.id) {
      this.axios.get('auth/verify/' + this.$route.params.id + '/' + this.$route.params.token).then(response => {
        this.response = response.data.message;
      });
    } else {
      this.response = "Please check your inbox for your verification email";
    }
  },
}
</script>

<style lang="css">
</style>
