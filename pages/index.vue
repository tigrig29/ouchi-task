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
          <b-icon-trash-fill variant="danger" @click="deleteTask(taskId)" />
          <b-form-textarea
            :id="`input-task-title-${cardId}-${taskId}`"
            class="task-title"
            placeholder="タスク内容を入力……"
            no-resize
            no-auto-shrink
            :value="task.title"
            @change="updateTaskTitle(taskId, arguments[0])"
          ></b-form-textarea>
          <div @click="toggleTaskDone(taskId)">
            <b-icon-circle v-if="!task.done" variant="success" />
            <b-icon-check-circle v-else variant="success" font-scale="1.2" />
          </div>
        </b-card-text>
      </b-card>
    </b-card-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import {
  BIconCircle,
  BIconCheck,
  BIconCheckCircle,
  BIconTrashFill
} from 'bootstrap-vue'
import { firebase } from '~/plugins/firebase'
import { cardStore, taskStore, userStore } from '~/store'
import firestoreWriter from '~/assets/libs/firestoreWriter'

import Logo from '~/components/Logo.vue'

@Component({
  components: {
    Logo,
    BIconCircle,
    BIconCheck,
    BIconCheckCircle,
    BIconTrashFill
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

  updateTaskTitle(taskId: string, title: string) {
    taskStore.updateTaskTitle({ taskId, title })
    firestoreWriter.updateTask(userStore.id || '', taskId)
  }

  toggleTaskDone(taskId: string) {
    taskStore.toggleTaskDone({ taskId })
    firestoreWriter.updateTask(userStore.id || '', taskId)
  }

  async deleteTask(taskId: string) {
    const result: boolean = await this.$bvModal.msgBoxConfirm(
      '削除してもよろしいですか？'
    )

    if (result) {
      firestoreWriter.deleteTask(userStore.id || '', taskId)
      taskStore.deleteTask({ taskId })
    }
  }
}
</script>

<style lang="scss" scoped>
.task-title {
  height: 36px;
  border: none;
}
</style>
