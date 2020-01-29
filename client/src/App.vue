<template>
  <div id="app">
      <my-navbar/>
      <router-view/>
  </div>
</template>

<script>
import Navbar from './components/generic/Navbar.vue';

export default {
  components: {
    'my-navbar': Navbar,
  }
}

</script>

<style lang="sass" src="./assets/mystyles.scss" />

