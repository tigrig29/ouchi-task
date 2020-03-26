<template>
  <b-card-text class="TaskAdd text-left">
    <b-form-textarea
      :id="`input-task-title-new-${taskListId}`"
      v-model="inputTaskTitle[taskListId]"
      class="TaskAdd__Title"
      placeholder="新規タスク名を入力……"
      no-resize
      no-auto-shrink
      @keydown.enter.prevent="submitToInputTaskTitle(taskListId)"
    ></b-form-textarea>
    <b-button
      :disabled="!inputTaskTitle[taskListId]"
      @click="submitToInputTaskTitle(taskListId)"
    >
      タスクを追加
    </b-button>
  </b-card-text>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

import { VuexTask } from '~/store/taskStore'

import { taskStore } from '~/store'
import vuexfire from '~/assets/libs/vuexfire'

@Component
export default class TaskAdd extends Vue {
  @Prop()
  taskListId!: string

  inputTaskTitle: { [key: string]: string } = {}

  // =================================================
  // Editor actions
  // =================================================

  // 新規 Task タイトル確定時処理
  submitToInputTaskTitle(taskListId: string) {
    const title = this.inputTaskTitle[taskListId]
    if (!title) return

    const vuexTask: VuexTask = {
      id: '',
      parentId: taskListId,
      title,
      position: taskStore.currentMaxPosition(taskListId),
      done: false,
      updatedAt: new Date()
    }
    this.addTask(vuexTask)

    this.inputTaskTitle[taskListId] = ''
  }

  // =================================================
  // Push to Firestore / Vuex
  // =================================================

  async addTask(vuexTaskNotHasId: VuexTask) {
    await vuexfire.task.addBoth(vuexTaskNotHasId)
  }
}
</script>

<style lang="scss" scoped>
.TaskAdd {
  &__Title {
    height: 36px;
  }
}
</style>
