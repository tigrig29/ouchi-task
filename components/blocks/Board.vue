<template>
  <b-card-group deck class="Board">
    <!-- TaskList -->
    <task-list
      v-for="taskList in taskLists"
      :key="`taskList-${taskList.id}`"
      :vuex-task-list="taskList"
    >
      <!-- Task -->
      <task
        v-for="task in tasks(taskList.id)"
        :key="`task-${task.id}`"
        :vuex-task="task"
      />
      <!-- Add Task -->
      <task-add :task-list-id="taskList.id" />
    </task-list>

    <!-- Add TaskList -->
    <b-button class="mt-4" @click="showTaskListEditor()">
      リストを追加
    </b-button>

    <!-- TaskListEditor -->
    <task-list-editor />
  </b-card-group>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import Task from '~/components/parts/Task.vue'
import TaskAdd from '~/components/parts/TaskAdd.vue'
import TaskList from '~/components/parts/TaskList.vue'
import TaskListEditor from '~/components/parts/TaskListEditor.vue'

import { VuexTaskList } from '~/store/taskListStore'
import { VuexTask } from '~/store/taskStore'

import { userStore, taskListStore, taskStore, taskListEditor } from '~/store'

import date from '~/assets/libs/date'
import firestoreManager from '~/assets/libs/firestoreManager'

@Component({
  components: {
    Task,
    TaskAdd,
    TaskList,
    TaskListEditor
  }
})
export default class Board extends Vue {
  intervalId?: NodeJS.Timeout = undefined
  clock: Date = new Date()

  get taskLists() {
    return taskListStore.list
  }

  get tasks() {
    return (taskListId: string) => {
      return taskStore.listFilteredByParentId(taskListId)
    }
  }

  // =================================================
  // ライフサイクルフック
  // =================================================

  created() {
    this.intervalId = setInterval(async () => {
      // 時計更新
      this.clock = new Date()

      // リセット対象取得
      const resetTargetTaskLists = this.resetTargetsOfTaskList()
      if (resetTargetTaskLists.length === 0) return

      // 対象の更新処理を Promise 配列へ保管
      const promises: Promise<void>[] = []

      for (const taskList of resetTargetTaskLists) {
        // TaskList.lastResetAt 更新処理
        promises.push(this.updateLastResetAt(taskList, this.clock))

        for (const task of taskStore.listFilteredByParentId(taskList.id)) {
          // Task.done 更新処理
          promises.push(this.resetDone(task, this.clock))
        }
      }

      // 処理実行
      await Promise.all(promises)
    }, 1000)
  }

  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId)
  }

  // =================================================
  // TaskListEditor
  // =================================================

  showTaskListEditor(taskListId?: string) {
    taskListEditor.init(taskListId)
    this.$bvModal.show('modal-taskList-editor')
  }

  // =================================================
  // To reset Task.done
  // =================================================

  // done リセットの必要がある TaskList リストを取得
  resetTargetsOfTaskList() {
    const vuexTaskLists: VuexTaskList[] = []

    for (const taskList of this.taskLists) {
      // lastResetAt から、次回リセット日付を取得
      const nextResetDate = date.addDateValues(
        date.reversePickUpDate(taskList.lastResetAt),
        taskList.denominatorUnit,
        parseInt(taskList.denominator)
      )
      // リセット対象判定
      if (this.clock >= nextResetDate) vuexTaskLists.push(taskList)
    }
    return vuexTaskLists
  }

  // TaskList 更新処理（done リセット処理で呼び出す）
  async updateLastResetAt(taskList: VuexTaskList, resetDate: Date) {
    const userId = userStore.id
    if (!userId) return

    // VuexTaskList の用意
    const vuexTaskList: VuexTaskList = {
      ...taskList,
      lastResetAt: date.pickUpDate(resetDate)
    }
    // FireTaskList の用意
    const fireTaskList = firestoreManager.taskList.convertVuexToFire(
      vuexTaskList
    )

    // Vuex の Update
    taskListStore.update({ taskList: vuexTaskList })
    // Firestore の Update
    await firestoreManager.taskList.update(userId, taskList.id, fireTaskList)
  }

  // Taks.done リセット処理
  async resetDone(task: VuexTask, updatedAt: Date) {
    const userId = userStore.id
    if (!userId) return

    // VuexTaskList の用意
    const vuexTask: VuexTask = {
      ...task,
      done: false,
      updatedAt
    }
    // FireTaskList の用意
    const fireTask = firestoreManager.task.convertVuexToFire(vuexTask)

    // Vuex の Update
    taskStore.update({ task: vuexTask })
    // Firestore の Update
    await firestoreManager.task.update(
      userId,
      vuexTask.parentId,
      vuexTask.id,
      fireTask
    )
  }
}
</script>
