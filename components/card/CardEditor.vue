<template>
  <b-modal id="modal-card-editor" size="md" centered :title="editorTitle">
    <!-- Title -->
    <b-form>
      <label for="input-card-editor-title">タイトル</label>
      <b-input
        id="input-card-editor-title"
        :value="values.title"
        :state="validState.title"
        placeholder="タイトルを入力してください"
        @input="setValue('title', arguments[0])"
      ></b-input>
    </b-form>

    <!-- Denominator settings -->
    <b-form class="mt-4">
      <label>リセット期間</label>
      <b-form inline>
        <!-- Denominator -->
        <label class="sr-only" for="input-card-editor-denominator">値</label>
        <b-input-group class="w-25 mb-2 mr-sm-2 mb-sm-0">
          <b-input
            id="input-card-editor-denominator"
            :value="values.denominator"
            :state="validState.denominator"
            type="number"
            @input="setValue('denominator', arguments[0])"
            @change="setValue('denominator', parseInt(arguments[0]))"
          ></b-input>
        </b-input-group>
        <!-- DenominatorUnit -->
        <label class="sr-only" for="input-card-editor-denominator-unit">
          単位
        </label>
        <b-form-select
          id="input-card-editor-denominator-unit"
          :value="values.denominatorUnit"
          :state="validState.denominatorUnit"
          class="w-25 mb-2 mr-sm-2 mb-sm-0"
          :options="[{ text: '選択...', value: null }, ...denominatorUnitItems]"
          @change="setValue('denominatorUnit', arguments[0])"
        ></b-form-select>
        <label>ごとにリセット</label>
      </b-form>
    </b-form>

    <!-- Last reset at -->
    <b-form class="mt-4">
      <label for="input-card-editor-last-reset-at">最終リセット日付</label>
      <b-form-datepicker
        id="input-card-editor-last-reset-at"
        :value="values.lastResetAt"
        class="mb-2 mr-sm-2 mb-sm-0"
        :state="validState.lastResetAt"
        @input="setValue('lastResetAt', arguments[0])"
      ></b-form-datepicker>
    </b-form>

    <!-- Delete -->
    <b-button v-show="id" class="mt-4" variant="danger" @click="deleteCard">
      削除
    </b-button>

    <!-- Footer -->
    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="close">
        キャンセル
      </b-button>
      <b-button variant="primary" :disabled="!validStateAll" @click="save">
        保存
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { cardEditor, userStore, cardStore } from '~/store'
import { Card } from '~/types/firestore'
import { CardEditorValues } from '~/store/cardEditor'
import firestoreWriter from '~/assets/libs/firestoreWriter'

interface DenominatorUnitItem {
  text: '日' | '週間' | 'ヶ月' | '年'
  value: Card['denominatorUnit']
}

@Component
export default class CardEditor extends Vue {
  denominatorUnitItems: DenominatorUnitItem[] = [
    { text: '日', value: 'day' },
    { text: '週間', value: 'week' },
    { text: 'ヶ月', value: 'month' },
    { text: '年', value: 'year' }
  ]

  get id() {
    return cardEditor.id
  }

  get values() {
    return cardEditor.values
  }

  get editorTitle(): string {
    return this.id ? 'グループ編集' : '新規グループ作成'
  }

  get cardForMutateCardStore(): Card {
    const { title, position, denominator, denominatorUnit } = this.values
    const lastResetDate = cardEditor.separatedLastResetDate
    return {
      title,
      position,
      denominator: parseInt(denominator),
      denominatorUnit,
      lastResetAt: new Date(
        lastResetDate.year,
        lastResetDate.month,
        lastResetDate.day
      )
    }
  }

  // =================================================
  // Validation
  // =================================================

  get validState(): { [N in keyof Required<CardEditorValues>]: boolean } {
    const {
      title,
      denominator,
      denominatorUnit,
      lastResetAt
    } = cardEditor.values
    return {
      title: title ? title.length > 0 : false,
      position: true, // エディターで position は編集しない
      denominator: denominator ? parseInt(denominator) > 0 : false,
      denominatorUnit: !!denominatorUnit,
      lastResetAt: !!lastResetAt
    }
  }

  get validStateAll(): boolean {
    const {
      title,
      position,
      denominator,
      denominatorUnit,
      lastResetAt
    } = this.validState
    return title && position && denominator && denominatorUnit && lastResetAt
  }

  // =================================================
  // Editor value changed actions
  // =================================================

  setValue(key: string, value: any) {
    const payload: Partial<CardEditorValues> = {}
    payload[key] = value
    cardEditor.setValue(payload)
  }

  // =================================================
  // Editor button actions
  // =================================================

  async save() {
    if (!this.validStateAll) return

    // 編集中なら update, 新規なら add
    if (cardEditor.id) await this.updateCard()
    else await this.addCard()

    this.close()
  }

  close() {
    this.$bvModal.hide('modal-card-editor')
    // values を即時リセットすると、
    // モーダルのフェードアウト中に値が変化してしまうので遅延
    setTimeout(() => {
      cardEditor.init()
    }, 200)
  }

  // =================================================
  // To update card
  // =================================================

  private async addCard() {
    const newCard = this.cardForMutateCardStore

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

  private async updateCard() {
    const cardId: string = this.id
    const newCard = this.cardForMutateCardStore

    cardStore.updateCard({ cardId, card: newCard })
    await firestoreWriter.updateCard(userStore.id || '', cardId)
  }

  async deleteCard() {
    const result: boolean = await this.$bvModal.msgBoxConfirm(
      '削除してもよろしいですか？'
    )

    if (result) {
      const cardId: string = this.id

      await firestoreWriter.deleteCard(userStore.id || '', cardId)
      cardStore.deleteCard({ cardId })
      this.close()
    }
  }
}
</script>
