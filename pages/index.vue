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
          <b-button @click="addTask(cardId)">タスクを追加</b-button>
        </b-card-text>
      </b-card>
    </b-card-group>
    <b-button class="mt-4" @click="showCardEditor('')">
      グループを追加
    </b-button>
    <b-modal id="modal-card-editor" size="md" centered :title="cardEditorTitle">
      <b-form>
        <label for="inline-form-input-name">タイトル</label>
        <b-input
          id="inline-form-input-name"
          v-model="edittingCardValue.title"
          :state="cardValidState.title"
          placeholder="タイトルを入力してください"
        ></b-input>
      </b-form>
      <b-form class="mt-4">
        <label>リセット期間</label>
        <b-form inline>
          <label class="sr-only" for="inline-form-input-name">値</label>
          <b-input-group class="w-25 mb-2 mr-sm-2 mb-sm-0">
            <b-input
              id="inline-form-input-name"
              v-model="edittingCardValue.denominator"
              :state="cardValidState.denominator"
              type="number"
            ></b-input>
          </b-input-group>

          <label class="sr-only" for="inline-form-custom-select-pref">
            単位
          </label>
          <b-form-select
            id="inline-form-custom-select-pref"
            v-model="edittingCardValue.denominatorUnit"
            :state="cardValidState.denominatorUnit"
            class="w-25 mb-2 mr-sm-2 mb-sm-0"
            :options="[
              { text: '選択...', value: null },
              { text: '日', value: 'day' },
              { text: '週間', value: 'week' },
              { text: '月', value: 'month' },
              { text: '年', value: 'year' }
            ]"
          ></b-form-select>
          <label>ごとにリセット</label>
        </b-form>
        <b-form class="mt-4">
          <label>最終リセット日付</label>
          <b-form-datepicker
            id="input-card-last-reset-at"
            v-model="edittingCardValue.lastResetAt"
            class="mb-2 mr-sm-2 mb-sm-0"
            :state="cardValidState.lastResetAt"
          ></b-form-datepicker>
        </b-form>
        <b-button
          v-show="!isEditingNewCard"
          class="mt-4"
          variant="danger"
          @click="deleteCard"
        >
          削除
        </b-button>
      </b-form>
      <template v-slot:modal-footer>
        <b-button variant="secondary" @click="closeCardEditor">
          キャンセル
        </b-button>
        <b-button
          variant="primary"
          :disabled="!cardValidStateAll"
          @click="saveCard"
        >
          保存
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import {
  BIconCircle,
  BIconCheck,
  BIconCheckCircle,
  BIconTrashFill,
  BIconGear
} from 'bootstrap-vue'
import { Card } from '../types/firestore'
import { firebase } from '~/plugins/firebase'
import { cardStore, taskStore, userStore } from '~/store'
import firestoreWriter from '~/assets/libs/firestoreWriter'
import date from '~/assets/libs/date'

import Logo from '~/components/Logo.vue'

@Component({
  components: {
    Logo,
    BIconCircle,
    BIconCheck,
    BIconCheckCircle,
    BIconTrashFill,
    BIconGear
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

  get cardEditorTitle() {
    return this.isEditingNewCard ? '新規グループ作成' : 'グループ編集'
  }

  get cardValidState() {
    return {
      title: this.edittingCardValue.title.length > 0,
      denominator: this.edittingCardValue.denominator > 0,
      denominatorUnit: this.edittingCardValue.denominatorUnit !== null,
      lastResetAt: this.edittingCardValue.lastResetAt !== null
    }
  }

  get cardValidStateAll() {
    return (
      this.cardValidState.title &&
      this.cardValidState.denominator &&
      this.cardValidState.denominatorUnit &&
      this.cardValidState.lastResetAt
    )
  }

  get isEditingNewCard() {
    return this.edittingCardId === ''
  }

  showCardEditor(cardId: string) {
    this.$bvModal.show('modal-card-editor')
    this.edittingCardId = cardId
    if (!this.isEditingNewCard) {
      this.edittingCardValue.title = cardStore.cardList[cardId].title
      this.edittingCardValue.denominator =
        cardStore.cardList[cardId].denominator
      this.edittingCardValue.denominatorUnit =
        cardStore.cardList[cardId].denominatorUnit
      this.edittingCardValue.lastResetAt = date.pickUpDate(
        cardStore.cardList[cardId].lastResetAt,
        '-'
      )
    }
  }

  closeCardEditor() {
    this.$bvModal.hide('modal-card-editor')
    this.edittingCardId = ''
    // edittingCardValue を即時リセットすると、
    // モーダルのフェードアウト中に値が変化してしまうので遅延
    setTimeout(() => {
      this.edittingCardValue = {
        title: '',
        position: 0,
        denominator: 1,
        denominatorUnit: 'day',
        lastResetAt: date.pickUpDate(new Date(), '-')
      }
    }, 200)
  }

  async saveCard() {
    // input type="number" の入力値が string っぽいのでキャスト
    if (typeof this.edittingCardValue.denominator === 'string') {
      this.edittingCardValue.denominator = parseInt(
        this.edittingCardValue.denominator
      )
    }

    if (this.isEditingNewCard) await this.addCard()
    else await this.updateCard()

    this.closeCardEditor()
  }

  async addCard() {
    const [
      year,
      month,
      day
    ]: string[] = this.edittingCardValue.lastResetAt.split('-')

    const newCard: Card = {
      ...this.edittingCardValue,
      position: cardStore.currentMaxPosition + 1,
      lastResetAt: new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }

    const { cardId, card } = await firestoreWriter.addCard(
      userStore.id || '',
      newCard.title,
      newCard.position,
      newCard.denominator,
      newCard.denominatorUnit,
      newCard.lastResetAt
    )
    cardStore.addCard({ cardId, card })
  }

  async updateCard() {
    const [
      year,
      month,
      day
    ]: string[] = this.edittingCardValue.lastResetAt.split('-')

    const cardId: string = this.edittingCardId
    const card: Card = {
      ...this.edittingCardValue,
      position: cardStore.cardList[cardId].position,
      lastResetAt: new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }

    cardStore.updateCard({ cardId, card })
    await firestoreWriter.updateCard(userStore.id || '', cardId)
  }

  async deleteCard() {
    const result: boolean = await this.$bvModal.msgBoxConfirm(
      '削除してもよろしいですか？'
    )

    if (result) {
      await firestoreWriter.deleteCard(userStore.id || '', this.edittingCardId)
      cardStore.deleteCard({ cardId: this.edittingCardId })
      this.closeCardEditor()
    }
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
