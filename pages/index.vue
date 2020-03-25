<template>
  <div class="main container-fluid">
    <p>{{ formattedClock }}</p>
    <button @click="logout">Logout</button>
    <b-card-group deck class="taskLists">
      <b-card
        v-for="taskList in taskLists"
        :key="`taskList-${taskList.id}`"
        class="text-center"
      >
        <template v-slot:header>
          <span>{{ taskList.title }}</span>
          <b-icon-gear @click="showTaskListEditor(taskList.id)" />
        </template>

        <task
          v-for="task in tasks(taskList.id)"
          :key="`task-${task.id}`"
          :vuex-task="task"
        />
        <task-add :task-list-id="taskList.id" />
      </b-card>
    </b-card-group>
    <b-button class="mt-4" @click="showTaskListEditor()">
      リストを追加
    </b-button>

    <!-- TaskListEditor -->
    <task-list-editor />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { BIconGear } from 'bootstrap-vue'
import Task from '~/components/parts/Task.vue'
import TaskAdd from '~/components/parts/TaskAdd.vue'
import TaskListEditor from '~/components/taskList/TaskListEditor.vue'

import { VuexTaskList } from '~/store/taskListStore'
import { VuexTask } from '~/store/taskStore'

import { firebase } from '~/plugins/firebase'
import { taskListStore, taskStore, userStore, taskListEditor } from '~/store'
import firestoreManager from '~/assets/libs/firestoreManager'
import date from '~/assets/libs/date'

@Component({
  components: {
    BIconGear,
    Task,
    TaskAdd,
    TaskListEditor
  },
  middleware: 'fetchFirestore'
})
export default class Index extends Vue {
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

      const userId = userStore.id
      if (!userId) return

      for (const taskList of this.taskLists) {
        const { id: taskListId, lastResetAt, denominator } = taskList

        const intDenominator = parseInt(denominator)
        const nextResetDate: Date = date.reversePickUpDate(lastResetAt)
        const [year, month, day] = [
          nextResetDate.getFullYear(),
          nextResetDate.getMonth(),
          nextResetDate.getDate()
        ]
        switch (taskList.denominatorUnit) {
          case 'day':
            nextResetDate.setDate(day + intDenominator)
            break
          case 'week':
            nextResetDate.setDate(day + intDenominator * 7)
            break
          case 'month':
            nextResetDate.setMonth(month + intDenominator)
            break
          case 'year':
            nextResetDate.setFullYear(year + intDenominator)
            break
        }

        const nowDate = new Date()

        if (nowDate >= nextResetDate) {
          const vuexTaskList: VuexTaskList = {
            ...taskList,
            lastResetAt: date.pickUpDate(nowDate)
          }
          const fireTaskList = firestoreManager.taskList.convertVuexToFire(
            vuexTaskList
          )
          taskListStore.update({ taskList: vuexTaskList })
          await firestoreManager.taskList.update(
            userId,
            taskListId,
            fireTaskList
          )

          for (const task of taskStore.listFilteredByParentId(taskListId)) {
            this.toggleTaskDone(task.id, false)
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
  // TaskListEditor
  // =================================================

  showTaskListEditor(taskListId?: string) {
    taskListEditor.init(taskListId)
    this.$bvModal.show('modal-taskList-editor')
  }

  // =================================================
  // Task
  // =================================================

  // Task 完了チェックボックスのクリック時処理
  toggleTaskDone(taskId: string, done?: boolean) {
    const targetTask = taskStore.findById(taskId)
    if (!targetTask) return

    const vuexTask: VuexTask = {
      ...targetTask,
      done: done ?? !targetTask.done,
      updatedAt: new Date()
    }
    this.updateTask(vuexTask)
  }

  async updateTask(vuexTask: VuexTask) {
    const userId = userStore.id
    if (!userId) return

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
