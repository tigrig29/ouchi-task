<template>
  <div class="main container-fluid">
    <button @click="logout">Logout</button>
    <board />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import Board from '~/components/blocks/Board.vue'

import { firebase } from '~/plugins/firebase'

@Component({
  components: { Board },
  middleware: 'fetchFirestore'
})
export default class Index extends Vue {
  // =================================================
  // 認証処理
  // =================================================

  async logout() {
    await firebase.auth().signOut()
    this.$router.push('/login')
  }
}
</script>
