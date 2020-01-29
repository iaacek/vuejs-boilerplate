<template lang="html">
  <nav class="navbar">

    <div class="navbar-menu" :class="{ 'is-active': menuClosed }" @click="menuClosed = false">
      <div class="navbar-start">

        <router-link to="/users" class="navbar-item" v-if="user.authenticated && auth.checkRole('systemRole', 'admin')">Users</router-link>

      </div>

      <div class="navbar-end">
        <span class="navbar-item" v-if="user.authenticated" >{{user.name}}({{user.systemRole}})</span>
        <router-link to="/login" class="navbar-item" v-if="!user.authenticated">Login</router-link>
        <router-link to="/register" class="navbar-item" v-if="!user.authenticated">Register</router-link>
        <a class="navbar-item" v-if="user.authenticated" @click="logout()">Logout</a>
      </div>

    </div>

  </nav>
</template>

<script>

export default {
  data() {
    return {
      user: this.auth.user,
      menuClosed: null,
    }
  },

  methods: {
    logout() {
      this.auth.logout(this);
    },
  },

  mounted: function () {
        const links = document.querySelectorAll(".navbar-item");
        links.forEach(link => {
            link.addEventListener("click", function () {
                link.classList.remove("is-active");
            });
        });
    }
};
</script>

<style lang="scss" scoped>
  /* https://github.com/jgthms/bulma/issues/2514 */
  /* Issue with menus not closing because Bulma does come with any javascript. The @media screen and mounted hook is the fix for that */
  @media screen and (min-width: 1025px) {
    .navbar-item.is-hoverable:hover .navbar-dropdown {
      display: block !important;
    }
    .navbar-item.is-hoverable:focus-within .navbar-dropdown {
      display: none;
    }
  }
</style>
