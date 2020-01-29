<template lang="html">
    <div class="container">

        <p v-if="this.auth.user.authenticated" class="title is-2 has-text-centered">Welcome in the system...</p>

        <p v-else class="title is-2 has-text-centered">Welcome, please login to proceed...</p>

    </div>

</template>

<script>
    export default {
        data() {
            return {

            }
        },
    }

</script>

<style>

</style>
