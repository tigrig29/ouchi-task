<template>
  <div class="main container-fluid">
    <p>{{ formattedClock }}</p>
    <button @click="logout">Logout</button>
    <b-card-group deck class="cards">
      <b-card
        v-for="(card, cardId) in cards"
        :key="`card-${cardId}`"
        class="text-center"
      >
        <template v-slot:header>
          <span>{{ card.title }}</span>
          <b-icon-gear @click="showCardEditor(cardId)" />
        </template>
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

        <b-card-text class="text-left">
          <b-form-textarea
            :id="`input-task-title-new-of-${cardId}`"
            v-model="newTaskTitle[cardId]"
            placeholder="タスク内容を入力……"
            no-resize
            no-auto-shrink
          ></b-form-textarea>
          <b-button :disabled="!newTaskTitle[cardId]" @click="addTask(cardId)">
            タスクを追加
          </b-button>
        </b-card-text>
      </b-card>
    </b-card-group>
    <b-button class="mt-4" @click="showCardEditor()">
      グループを追加
    </b-button>
    <card-editor />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import {
  BIconCircle,
  BIconCheckCircle,
  BIconTrashFill,
  BIconGear
} from 'bootstrap-vue'
import { Card } from '~/types/firestore'
import { firebase } from '~/plugins/firebase'
import { cardStore, taskStore, userStore, cardEditor } from '~/store'
import firestoreWriter from '~/assets/libs/firestoreWriter'
import date from '~/assets/libs/date'
import CardEditor from '~/components/card/CardEditor.vue'

@Component({
  components: {
    BIconCircle,
    BIconCheckCircle,
    BIconTrashFill,
    BIconGear,
    CardEditor
  },
  middleware: 'fetchFirestore'
})
export default class Index extends Vue {
  intervalId?: NodeJS.Timeout = undefined
  clock: Date = new Date()

  newTaskTitle: { [key: string]: string } = {}
  edittingCardId = ''
  edittingCardValue: any = {
    title: '',
    position: 0,
    denominator: 1,
    denominatorUnit: 'day',
    lastResetAt: date.pickUpDate(new Date(), '-')
  }

  get cards() {
    return cardStore.cardList
  }

  get tasks() {
    return (cardId: string) => {
      return taskStore.tasksSearchedByCardId(cardId)
    }
  }

  get formattedClock() {
    return date.format(this.clock)
  }

  // =================================================
  // ライフサイクルフック
  // =================================================

  created() {
    this.intervalId = setInterval(async () => {
      // 時計更新
      this.clock = new Date()

      for (const cardId in cardStore.cardList) {
        const card = cardStore.cardList[cardId]

        const [year, month, day]: number[] = date
          .pickUpDate(card.lastResetAt)
          .split('/')
          .map((value) => parseInt(value, 10))
        const nextResetDate: Date = new Date(year, month - 1, day)
        switch (card.denominatorUnit) {
          case 'day':
            nextResetDate.setDate(day + card.denominator)
            break
          case 'week':
            nextResetDate.setDate(day + card.denominator * 7)
            break
          case 'month':
            nextResetDate.setMonth(month + card.denominator)
            break
          case 'year':
            nextResetDate.setFullYear(year + card.denominator)
            break
        }
        if (new Date() >= nextResetDate) {
          const newCard: Card = {
            ...card,
            lastResetAt: new Date()
          }
          cardStore.updateCard({ cardId, card: newCard })
          await firestoreWriter.updateCard(userStore.id || '', cardId)

          for (const taskId in taskStore.tasksSearchedByCardId(cardId)) {
            this.toggleTaskDone(taskId, false)
          }
        }
      }
    }, 1000)
  }

  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId)
  }

  // =================================================
  // 認証処理
  // =================================================

  async logout() {
    await firebase.auth().signOut()
    this.$router.push('/login')
  }

  // =================================================
  // card の更新処理
  // =================================================

  showCardEditor(cardId?: string) {
    cardEditor.init(cardId)
    this.$bvModal.show('modal-card-editor')
  }

  // =================================================
  // task の更新処理
  // =================================================

  async addTask(cardId: string) {
    const title: string = this.newTaskTitle[cardId]
    const position: number = taskStore.currentMaxPosition(cardId) + 1

    const { taskId, task } = await firestoreWriter.addTask(
      userStore.id || '',
      cardId,
      title,
      position
    )
    taskStore.addTask({ taskId, task })

    this.newTaskTitle[cardId] = ''
  }

  updateTaskTitle(taskId: string, title: string) {
    taskStore.updateTaskTitle({ taskId, title })
    firestoreWriter.updateTask(userStore.id || '', taskId)
  }

  toggleTaskDone(taskId: string, done?: boolean) {
    taskStore.toggleTaskDone({ taskId, done })
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
