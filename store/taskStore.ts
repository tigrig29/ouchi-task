import Vue from 'vue'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

export interface VuexTask {
  id: string
  parentId: string
  title: string
  position: number
  done: boolean
  updatedAt: Date
}

@Module({ stateFactory: true, namespaced: true, name: 'taskStore' })
export default class TaskStore extends VuexModule {
  list: VuexTask[] = []

  /**
   * 対象の parentId を持つ Task 一覧を取得する
   */
  get listFilteredByParentId() {
    return (parentId: string): VuexTask[] => {
      return this.list.filter((task) => {
        return task.parentId === parentId
      })
    }
  }

  /**
   * 対象の Task を取得する（id 検索）
   */
  get findById() {
    return (id: string): VuexTask | undefined => {
      return this.list.find((task) => {
        return task.id === id
      })
    }
  }

  /**
   * 対象の Task を取得する（id 検索）
   */
  private get findIndexById() {
    return (id: string) => {
      return this.list.findIndex((task) => {
        return task.id === id
      })
    }
  }

  /**
   * task 内で、最大の task.position の値
   */
  get currentMaxPosition() {
    return (parentId: string): number => {
      return this.listFilteredByParentId(parentId).length
    }
  }

  // =================================================
  // Initializer of Task
  // =================================================

  /**
   * Task 一覧の消去
   */
  @Mutation
  clear() {
    this.list.splice(0)
  }

  /**
   * Task 一覧の position 値ソート
   */
  @Mutation
  sortList() {
    this.list.sort((task1, task2) => {
      if (task1.position > task2.position) return 1
      if (task1.position < task2.position) return -1
      return 0
    })
  }

  // =================================================
  // Task Controller
  // =================================================

  @Mutation
  private mutateToUpdate(payload: { targetIndex: number; task: VuexTask }) {
    const { targetIndex, task } = payload
    Vue.set(this.list, targetIndex, task)
  }

  @Mutation
  private mutateToDelete(payload: { targetIndex: number }) {
    const { targetIndex } = payload
    this.list.splice(targetIndex, 1)
  }

  /**
   * 新規 Task をデータリストに追加する
   * @param payload { task } 新規追加する Task データオブジェクト
   */
  @Mutation
  add(payload: { task: VuexTask }) {
    const { task } = payload
    this.list.push(task)
  }

  /**
   * Task を更新する
   * @param payload { task } 更新後の Task データオブジェクト
   */
  @Action
  update(payload: { task: VuexTask }) {
    const { task } = payload
    const targetIndex = this.findIndexById(task.id)
    this.mutateToUpdate({ targetIndex, task })
  }

  /**
   * Task を削除する
   * @param payload { task } 削除対象の Task データオブジェクト
   */
  @Action
  delete(payload: { taskId: string }) {
    const { taskId } = payload
    const targetIndex = this.findIndexById(taskId)
    this.mutateToDelete({ targetIndex })
  }
}
