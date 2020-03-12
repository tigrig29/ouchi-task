<template>
  <div class="main container-fluid">
    <logo />
    <h1 class="title">
      ouchi-task
    </h1>
    <h2 class="subtitle">
      片付け、掃除、洗濯……日々繰り返し行う家事のタスク管理を行うツール
    </h2>
    <button @click="logout">Log out</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import firebase from '~/plugins/firebase'

import Logo from '~/components/Logo.vue'

@Component({
  components: {
    Logo
  }
})
export default class Index extends Vue {
  async logout() {
    await firebase.auth().signOut()
    this.$router.push('/login')
  }
}
</script>
