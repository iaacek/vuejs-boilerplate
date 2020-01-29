<template>

  <div v-show="info" class="notification is-info level">
    <div><strong>{{ info }}</strong></div>
    <div v-if="!link" class="level-right"><a class="button is-small is-warning" @click="closeInfoBox">Close</a></div>
    <div v-else class="level-right"><router-link :to="link" class="level-item button is-success">{{ linkLabel }}</router-link></div>
  </div>

</template>

<script>

  export default {
    props: {
      info: String,
      link: {
        type: String,
        default: null
      },
      linkLabel: {
        type: String,
        default: null
      }
    },

    methods: {
      closeInfoBox() {
        this.$emit('update:info', null);
      }
    }

  }

</script>
