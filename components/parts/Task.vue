<template>
  <b-card-text class="Task text-left">
    <b-icon-trash-fill variant="danger" @click="onClickDelete(vuexTask.id)" />
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
    <div @click="toggleTaskDone(vuexTask.id)">
      <b-icon-circle v-if="!vuexTask.done" variant="success" />
      <b-icon-check-circle v-else variant="success" font-scale="1.2" />
    </div>
  </b-card-text>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

import { BIconCircle, BIconCheckCircle, BIconTrashFill } from 'bootstrap-vue'

import { VuexTask } from '~/store/taskStore'

import { taskStore } from '~/store'
import vuexfire from '~/assets/libs/vuexfire'

@Component({
  components: {
    BIconCircle,
    BIconCheckCircle,
    BIconTrashFill
  }
})
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
    await vuexfire.task.updateBoth(vuexTask)
  }

  async deleteTask(vuexTask: VuexTask) {
    // Vuex, Firestore 両方削除
    await vuexfire.task.deleteBoth(vuexTask)
  }
}
</script>

<style lang="scss" scoped>
.Task {
  &__Title {
    height: 36px;
    border: none;
  }
}
</style>
