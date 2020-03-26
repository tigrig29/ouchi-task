import { FireTaskList, FireTask } from '~/types/firestore'
import { VuexTaskList } from '~/store/taskListStore'
import { VuexTask } from '~/store/taskStore'

import { userStore, taskListStore, taskStore } from '~/store'
import date from '~/assets/libs/date'
import firestoreManager from '~/assets/libs/firestoreManager'

const vuexfire = {
  // =================================================
  // TaskList
  // =================================================
  taskList: {
    // -----------------------------------------------
    // Getters
    // -----------------------------------------------
    /**
     * FireTaskList 型の taskList オブジェクトを、 VuexTaskList 型に変換する
     */
    get convertFireToVuex() {
      return (taskListId: string, fireTaskList: FireTaskList) => {
        const {
          title,
          position,
          denominator,
          denominatorUnit,
          lastResetAt
        } = fireTaskList
        const vuexTaskList: VuexTaskList = {
          id: taskListId,
          title,
          position,
          denominator: denominator.toString(),
          denominatorUnit: denominatorUnit as VuexTaskList['denominatorUnit'],
          lastResetAt: date.pickUpDate(lastResetAt.toDate())
        }
        return vuexTaskList
      }
    },
    /**
     * VuexTaskList 型の taskList オブジェクトを、 FireTaskList 型に変換する
     */
    get convertVuexToFire() {
      return (vuexTaskList: VuexTaskList) => {
        const {
          title,
          position,
          denominator,
          denominatorUnit,
          lastResetAt
        } = vuexTaskList
        const fireTaskList: FireTaskList = {
          title: title || '',
          position: position || -1,
          denominator: parseInt(denominator || '0'),
          denominatorUnit: denominatorUnit || '',
          lastResetAt: date.reversePickUpDate(
            lastResetAt || '2020-01-01'
          ) as any
        }
        return fireTaskList
      }
    },

    // -----------------------------------------------
    // Mutations
    // -----------------------------------------------
    /**
     * Vuex, Firestore 両方に TaskList を追加する
     * @param taskListNotHasId 新しい VuexTaskList
     */
    async addBoth(taskListNotHasId: VuexTaskList) {
      const userId = userStore.id
      if (!userId) return

      // FireTaskList の用意
      const fireTaskList = this.convertVuexToFire(taskListNotHasId)
      // Firestore へ Add
      const taskListId = await firestoreManager.taskList.add(
        userId,
        fireTaskList
      )

      // VuexTaskList の用意
      const vuexTaskList: VuexTaskList = { ...taskListNotHasId, id: taskListId }
      // VuexStore へ Add
      taskListStore.add({ taskList: vuexTaskList })
    },
    /**
     * Vuex, Firestore 両方の TaskList を更新する
     * @param taskList 新しい（更新後の） VuexTaskList
     */
    async updateBoth(taskList: VuexTaskList) {
      const userId = userStore.id
      if (!userId) return

      // FireTaskList の用意
      const fireTaskList = this.convertVuexToFire(taskList)

      // Vuex の Update
      taskListStore.update({ taskList })
      // Firestore の Update
      await firestoreManager.taskList.update(userId, taskList.id, fireTaskList)
    },
    /**
     * Vuex, Firestore 両方の TaskList を更新する
     * @param taskList 新しい（更新後の） VuexTaskList
     */
    async deleteBoth(taskList: VuexTaskList) {
      const userId = userStore.id
      if (!userId) return

      await firestoreManager.taskList.delete(userId, taskList.id)
      taskListStore.delete({ taskListId: taskList.id })
    }
  },

  // =================================================
  // Task
  // =================================================
  task: {
    // -----------------------------------------------
    // Getters
    // -----------------------------------------------
    /**
     * FireTask 型の task オブジェクトを、 VuexTask 型に変換する
     */
    get convertFireToVuex() {
      return (
        taskListId: string,
        taskId: string,
        fireTask: FireTask
      ): VuexTask => {
        const { title, position, done, updatedAt } = fireTask
        const vuexTask: VuexTask = {
          id: taskId,
          parentId: taskListId,
          title,
          position,
          done,
          updatedAt: updatedAt.toDate()
        }
        return vuexTask
      }
    },
    /**
     * VuexTask 型の task オブジェクトを、 FireTask 型に変換する
     */
    get convertVuexToFire() {
      return (vuexTask: VuexTask) => {
        const { title, position, done, updatedAt } = vuexTask
        const fireTask: FireTask = {
          title,
          position,
          done,
          updatedAt: updatedAt as any
        }
        return fireTask
      }
    },

    // -----------------------------------------------
    // Mutations
    // -----------------------------------------------
    /**
     * Vuex, Firestore 両方に Task を追加する
     * @param task 新しい VuexTask
     */
    async addBoth(taskNotHasId: VuexTask) {
      const userId = userStore.id
      if (!userId) return

      // FireTask の用意
      const fireTask = this.convertVuexToFire(taskNotHasId)
      // Firestore へ Add
      const taskId = await firestoreManager.task.add(
        userId,
        taskNotHasId.parentId,
        fireTask
      )

      // VuexTask の用意
      const vuexTask: VuexTask = { ...taskNotHasId, id: taskId }
      // VuexStore へ Add
      taskStore.add({ task: vuexTask })
    },
    /**
     * Vuex, Firestore 両方の Task を更新する
     * @param task 新しい（更新後の） VuexTask
     */
    async updateBoth(task: VuexTask) {
      const userId = userStore.id
      if (!userId) return

      // FireTaskList の用意
      const fireTask = this.convertVuexToFire(task)

      // Vuex の Update
      taskStore.update({ task })
      // Firestore の Update
      await firestoreManager.task.update(
        userId,
        task.parentId,
        task.id,
        fireTask
      )
    },
    /**
     * Vuex, Firestore 両方の Task を更新する
     * @param task 新しい（更新後の） VuexTask
     */
    async deleteBoth(task: VuexTask) {
      const userId = userStore.id
      if (!userId) return

      await firestoreManager.task.delete(userId, task.parentId, task.id)
      taskStore.delete({ taskId: task.id })
    }
  }
}

export default vuexfire
