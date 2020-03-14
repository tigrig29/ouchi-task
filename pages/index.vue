<template>
  <div class="main container-fluid">
    <button @click="logout">Logout</button>
    <b-card-group deck class="cards">
      <b-card
        v-for="(card, i) in cards"
        :key="`card-${i}`"
        :header="card.title"
        class="text-center"
      >
        <b-card-text
          v-for="(task, j) in card.tasks"
          :key="`task-${j}`"
          class="text-left"
        >
          {{ task.title }}
          <transition name="fade">
            <b-icon-circle v-if="!task.done" variant="success" />
            <b-icon-check-circle v-else variant="success" font-scale="1.2" />
          </transition>
        </b-card-text>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { BIconCircle, BIconCheck, BIconCheckCircle } from 'bootstrap-vue'
import { firebase } from '~/plugins/firebase'
import { userStore, taskStore } from '~/store'

import Logo from '~/components/Logo.vue'

@Component({
  components: {
    Logo,
    BIconCircle,
    BIconCheck,
    BIconCheckCircle
  }
})
export default class Index extends Vue {
  mounted() {
    // userStore.isAuthenticated の判定は不要：middleware/redirect で行っているため
    taskStore.fetch(userStore.id)
  }

  get cards() {
    return taskStore.cards
  }

  async logout() {
    await firebase.auth().signOut()
    this.$router.push('/login')
  }
}
</script>
