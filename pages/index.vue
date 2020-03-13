<template>
  <div class="main container-fluid">
    <b-card-group deck class="cards">
      <b-card
        v-for="(card, i) in cards"
        :key="i"
        :header="card.title"
        class="text-center"
      >
        <b-card-text>{{ card.position }}</b-card-text>
        <b-card-text>{{ card.denominator }}</b-card-text>
        <b-card-text>{{ card.denominatorUnit }}</b-card-text>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { firebase } from '~/plugins/firebase'
import { userStore, cardsStore } from '~/store'

import Logo from '~/components/Logo.vue'

@Component({
  components: {
    Logo
  }
})
export default class Index extends Vue {
  mounted() {
    // userStore.isAuthenticated の判定は不要：middleware/redirect で行っているため
    cardsStore.fetchCards(userStore.id)
  }

  get cards() {
    return cardsStore.list
  }

  async logout() {
    await firebase.auth().signOut()
    this.$router.push('/login')
  }
}
</script>
