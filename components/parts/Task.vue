<template>
  <div class="Task text-left py-1">
    <div
      class="Task__Checkbox border rounded"
      :class="{
        'bg-success': vuexTask.done
      }"
      @click="toggleTaskDone(vuexTask.id)"
    >
      <svg
        class="Task__Checkbox__Icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 7.27612L6.89697 10.8518L13.6645 4.12843"
          stroke="white"
          stroke-width="2"
        />
      </svg>
    </div>
    <b-form-textarea
      :id="`input-task-title-${vuexTask.parentId}-${vuexTask.id}`"
      class="Task__Title"
      placeholder="タスク内容を入力……"
      no-resize
      no-auto-shrink
      :value="vuexTask.title"
      @change="submitToUpdateTaskTitle(vuexTask.id, arguments[0])"
      @keydown.enter.prevent="
        submitToUpdateTaskTitle(vuexTask.id, arguments[0].target.value)
        arguments[0].target.blur()
      "
    ></b-form-textarea>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

import { VuexTask } from '~/store/taskStore'

import { taskStore } from '~/store'
import { VfTask } from '~/assets/libs/vuexfire'

@Component
export default class Task extends Vue {
  @Prop()
  vuexTask!: VuexTask

  // =================================================
  // Editor actions
  // =================================================

  // Task タイトルの変更確定時処理
  submitToUpdateTaskTitle(taskId: string, title?: string) {
    if (!title) return

    const targetTask = taskStore.findById(taskId)
    if (!targetTask) return

    const vuexTask: VuexTask = {
      ...targetTask,
      title,
      updatedAt: new Date()
    }
    this.updateTask(vuexTask)
  }

  // Task 完了チェックボックスのクリック時処理
  toggleTaskDone(taskId: string) {
    const targetTask = taskStore.findById(taskId)
    if (!targetTask) return

    const vuexTask: VuexTask = {
      ...targetTask,
      done: !targetTask.done,
      updatedAt: new Date()
    }
    this.updateTask(vuexTask)
  }

  // 削除ボタン押下時処理
  async onClickDelete(taskId: string) {
    const result: boolean = await this.$bvModal.msgBoxConfirm(
      '削除してもよろしいですか？'
    )

    const targetTask = taskStore.findById(taskId)
    if (!targetTask) return

    if (result) this.deleteTask(targetTask)
  }

  // =================================================
  // Push to Firestore / Vuex
  // =================================================

  async updateTask(vuexTask: VuexTask) {
    // Vuex, Firestore 両方更新
    await VfTask.updateBoth(vuexTask)
  }

  async deleteTask(vuexTask: VuexTask) {
    // Vuex, Firestore 両方削除
    await VfTask.deleteBoth(vuexTask)
  }
}
</script>

<style lang="scss" scoped>
.Task {
  display: grid;
  grid-template-columns: 24px 1fr;
  align-content: center;
  align-items: center;
  &__Checkbox {
    width: 18px;
    height: 18px;
    margin: auto;
    cursor: pointer;
    &__Icon {
      vertical-align: 2px;
    }
  }
  &__Title {
    height: 36px;
    overflow: hidden;
    border: none;
  }
}
</style>
