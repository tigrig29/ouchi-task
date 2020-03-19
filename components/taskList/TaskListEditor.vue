<template>
  <b-modal id="modal-taskList-editor" size="md" centered :title="editorTitle">
    <!-- Title -->
    <b-form>
      <label for="input-taskList-editor-title">タイトル</label>
      <b-input
        id="input-taskList-editor-title"
        :value="editingTaskList.title"
        :state="validState.title"
        placeholder="タイトルを入力してください"
        @input="updateEditingTaskList('title', arguments[0])"
      ></b-input>
    </b-form>

    <!-- Denominator settings -->
    <b-form class="mt-4">
      <label>リセット期間</label>
      <b-form inline>
        <!-- Denominator -->
        <label class="sr-only" for="input-taskList-editor-denominator">
          値
        </label>
        <b-input-group class="w-25 mb-2 mr-sm-2 mb-sm-0">
          <b-input
            id="input-taskList-editor-denominator"
            :value="editingTaskList.denominator"
            :state="validState.denominator"
            type="number"
            @input="updateEditingTaskList('denominator', arguments[0])"
          ></b-input>
        </b-input-group>
        <!-- DenominatorUnit -->
        <label class="sr-only" for="input-taskList-editor-denominator-unit">
          単位
        </label>
        <b-form-select
          id="input-taskList-editor-denominator-unit"
          :value="editingTaskList.denominatorUnit"
          :state="validState.denominatorUnit"
          class="w-25 mb-2 mr-sm-2 mb-sm-0"
          :options="[{ text: '選択...', value: null }, ...denominatorUnitItems]"
          @input="updateEditingTaskList('denominatorUnit', arguments[0])"
        ></b-form-select>
        <label>ごとにリセット</label>
      </b-form>
    </b-form>

    <!-- Last reset at -->
    <b-form class="mt-4">
      <label for="input-taskList-editor-last-reset-at">最終リセット日付</label>
      <b-form-datepicker
        id="input-taskList-editor-last-reset-at"
        :value="editingTaskList.lastResetAt"
        class="mb-2 mr-sm-2 mb-sm-0"
        :state="validState.lastResetAt"
        @input="updateEditingTaskList('lastResetAt', arguments[0])"
      ></b-form-datepicker>
    </b-form>

    <!-- Delete -->
    <b-button
      v-show="editingTaskList.id"
      class="mt-4"
      variant="danger"
      @click="onClickDelete"
    >
      削除
    </b-button>

    <!-- Footer -->
    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="close">
        キャンセル
      </b-button>
      <b-button
        variant="primary"
        :disabled="!validStateAll"
        @click="onClickSave"
      >
        保存
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { VuexTaskList } from '~/store/taskListStore'
import { taskListEditor } from '~/store'

interface DenominatorUnitItem {
  text: '日' | '週間' | 'ヶ月' | '年'
  value: VuexTaskList['denominatorUnit']
}

@Component
export default class TaskListEditor extends Vue {
  // リセット期間の単位リスト
  denominatorUnitItems: DenominatorUnitItem[] = [
    { text: '日', value: 'day' },
    { text: '週間', value: 'week' },
    { text: 'ヶ月', value: 'month' },
    { text: '年', value: 'year' }
  ]

  // エディタヘッダーに表示するタイトル
  get editorTitle(): string {
    return taskListEditor.taskList.id ? 'リスト編集' : '新規リスト作成'
  }

  // エディタの各入力フォームにおけるバリデーション用 State
  get validState() {
    return taskListEditor.validState
  }

  // エディタの全入力フォームのバリデーション結果
  get validStateAll() {
    return taskListEditor.validStateAll
  }

  get editingTaskList() {
    return taskListEditor.taskList
  }

  // =================================================
  // Editor actions
  // =================================================

  // 各種入力フォームの input, change イベント： 編集中 TaskList の値更新
  updateEditingTaskList(key: string, value: any) {
    taskListEditor.updateValues({ key, value })
  }

  // 『保存』ボタンのクリックアクション： 編集中 TaskList → Vuex, Firestore に Add or Update → モーダル閉じる
  async onClickSave() {
    if (!this.validStateAll) return
    await taskListEditor.save()
    this.close()
  }

  // 『削除』ボタンのクリックアクション： 編集中 TaskList → Vuex, Firestore にて Delete
  async onClickDelete() {
    // 削除確認
    const result: boolean = await this.$bvModal.msgBoxConfirm(
      '削除してもよろしいですか？'
    )

    if (result) await taskListEditor.pushToDelete()

    this.close()
  }

  // モーダルを閉じる
  close() {
    this.$bvModal.hide('modal-taskList-editor')
  }
}
</script>
