<template>

  <div v-show="error" class="notification is-danger level">
    <div><strong>Oops:&nbsp;</strong>{{ error }}</div>
    <div class="level-right"><a class="button is-small is-warning" @click="closeErrorBox">Close</a></div>
  </div>

</template>

<script>

export default {
  props: {
    error: null // making this typeless so I can pass strings or objects
  },

  methods: {
    closeErrorBox() {
      this.$emit('update:error', null);
    }
  }
}


</script>
