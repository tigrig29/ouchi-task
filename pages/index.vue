<template>
  <div class="main container-fluid">
    <button @click="logout">Logout</button>
    <b-card-group deck class="cards">
      <b-card
        v-for="(card, cardId) in cards"
        :key="`card-${cardId}`"
        :header="card.title"
        class="text-center"
      >
        <b-card-text
          v-for="(task, taskId) in tasks(cardId)"
          :key="`task-${taskId}`"
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
import { cardStore, taskStore } from '~/store'

import Logo from '~/components/Logo.vue'

@Component({
  components: {
    Logo,
    BIconCircle,
    BIconCheck,
    BIconCheckCircle
  },
  middleware: 'fetchFirestore'
})
export default class Index extends Vue {
  get cards() {
    return cardStore.cardList
  }

  get tasks() {
    return (cardId: string) => {
      return taskStore.tasksSearchedByCardId(cardId)
    }
  }

  async logout() {
    await firebase.auth().signOut()
    this.$router.push('/login')
  }
}
</script>
