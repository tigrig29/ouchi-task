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

  @Mutation
  clearTasks() {
    this.taskList = {}
  }

  @Mutation
  addTask(payload: { taskId: string; task: Task }) {
    const { taskId, task } = payload
    this.taskList[taskId] = task
  }
}
