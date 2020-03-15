import Vue from 'vue'
import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { firestore } from 'firebase'
import { db } from '~/plugins/firebase'
import { TaskList, Task } from '~/types/firestore'

@Module({ stateFactory: true, namespaced: true, name: 'taskStore' })
export default class TaskStore extends VuexModule {
  taskList: TaskList = {}

  get tasksRef() {
    return (
      userId: string,
      cardId: string
    ): firestore.CollectionReference<firestore.DocumentData> => {
      return db.doc(`users/${userId}/cards/${cardId}`).collection('tasks')
    }
  }

  get tasksSearchedByCardId() {
    return (cardId: string): TaskList => {
      const taskList: TaskList = {}
      for (const taskId in this.taskList) {
        const task = this.taskList[taskId]
        if (task.parentCardId === cardId) taskList[taskId] = task
      }
      return taskList
    }
  }

  get currentMaxPosition() {
    return (cardId: string): number => {
      let max: number = -1
      for (const taskId in this.tasksSearchedByCardId(cardId)) {
        const task = this.taskList[taskId]
        if (task.position > max) max = task.position
      }
      return max
    }
  }

  @Mutation
  clearTasks() {
    this.taskList = {}
  }

  @Mutation
  addTask(payload: { taskId: string; task: Task }) {
    const { taskId, task } = payload
    Vue.set(this.taskList, taskId, {} as Task)
    this.taskList[taskId] = task
  }

  @Mutation
  updateTaskTitle(payload: { taskId: string; title: string }) {
    const { taskId, title } = payload
    const task = this.taskList[taskId]
    task.title = title
  }

  @Mutation
  toggleTaskDone(payload: { taskId: string }) {
    const { taskId } = payload
    const task = this.taskList[taskId]
    task.done = !task.done
  }

  @Mutation
  deleteTask(payload: { taskId: string }) {
    const { taskId } = payload
    Vue.delete(this.taskList, taskId)
  }
}
