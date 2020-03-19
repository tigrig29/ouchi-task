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
        <b-card-text
          v-for="task in tasks(taskList.id)"
          :key="`task-${task.id}`"
          class="text-left"
        >
          <b-icon-trash-fill variant="danger" @click="onClickDelete(task.id)" />
          <b-form-textarea
            :id="`input-task-title-${taskList.id}-${task.id}`"
            class="task-title"
            placeholder="タスク内容を入力……"
            no-resize
            no-auto-shrink
            :value="task.title"
            @change="submitToUpdateTaskTitle(task.id, arguments[0])"
            @keydown.enter.prevent="
              submitToUpdateTaskTitle(task.id, arguments[0].target.value)
              arguments[0].target.blur()
            "
          ></b-form-textarea>
          <div @click="toggleTaskDone(task.id)">
            <b-icon-circle v-if="!task.done" variant="success" />
            <b-icon-check-circle v-else variant="success" font-scale="1.2" />
          </div>
        </b-card-text>

        <b-card-text class="text-left">
          <b-form-textarea
            :id="`input-task-title-new-${taskList.id}`"
            v-model="inputTaskTitle[taskList.id]"
            class="task-title-new"
            placeholder="新規タスク名を入力……"
            no-resize
            no-auto-shrink
            @change="submitToInputTaskTitle(taskList.id)"
            @keydown.enter.prevent="submitToInputTaskTitle(taskList.id)"
          ></b-form-textarea>
          <b-button
            :disabled="!inputTaskTitle[taskList.id]"
            @click="submitToInputTaskTitle(taskList.id)"
          >
            タスクを追加
          </b-button>
        </b-card-text>
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

import {
  BIconCircle,
  BIconCheckCircle,
  BIconTrashFill,
  BIconGear
} from 'bootstrap-vue'
import TaskListEditor from '~/components/taskList/TaskListEditor.vue'

import { VuexTask } from '~/store/taskStore'
import { VuexTaskList } from '~/store/taskListStore'

import { firebase } from '~/plugins/firebase'
import { taskListStore, taskStore, userStore, taskListEditor } from '~/store'
import firestoreManager from '~/assets/libs/firestoreManager'
import date from '~/assets/libs/date'

@Component({
  components: {
    BIconCircle,
    BIconCheckCircle,
    BIconTrashFill,
    BIconGear,
    TaskListEditor
  },
  middleware: 'fetchFirestore'
})
export default class Index extends Vue {
  intervalId?: NodeJS.Timeout = undefined
  clock: Date = new Date()

  inputTaskTitle: { [key: string]: string } = {}

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
  // task の更新処理
  // =================================================

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

  async onClickDelete(taskId: string) {
    const result: boolean = await this.$bvModal.msgBoxConfirm(
      '削除してもよろしいですか？'
    )

    const targetTask = taskStore.findById(taskId)
    if (!targetTask) return

    if (result) this.deleteTask(targetTask)
  }

  async addTask(vuexTask: VuexTask) {
    const userId = userStore.id
    if (!userId) return

    // VuexTaskList, FireTaskList の用意
    const fireTask = firestoreManager.task.convertVuexToFire(vuexTask)

    // Firestore へ Add
    const taskId = await firestoreManager.task.add(
      userId,
      vuexTask.parentId,
      fireTask
    )
    // Vuex へ Add
    vuexTask.id = taskId
    taskStore.add({ task: vuexTask })
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

  async deleteTask(vuexTask: VuexTask) {
    const userId = userStore.id
    if (!userId) return

    await firestoreManager.task.delete(userId, vuexTask.parentId, vuexTask.id)
    taskStore.delete({ taskId: vuexTask.id })
  }
}
</script>

<style lang="scss" scoped>
.task-title {
  height: 36px;
  border: none;
  &-new {
    height: 36px;
  }
}
</style>
