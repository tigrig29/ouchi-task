<template>
  <div>
    <div v-if="duringAuthenticated">
      ログイン中……
    </div>
    <button v-else class="Sample" @click="login">ログイン</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import firebase from '~/plugins/firebase'

import { userStore } from '~/store'

@Component
export default class Account extends Vue {
  get duringAuthenticated() {
    return userStore.duringAuthentication
  }

  async login() {
    userStore.setDuringAuthentication(true)
    const provider = new firebase.auth.GoogleAuthProvider()
    await firebase.auth().signInWithPopup(provider)
    this.$router.push('/')
  }
}
</script>
