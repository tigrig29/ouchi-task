import Vue from 'vue'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

export interface VuexTaskList {
  id: string
  title: string
  position: number
  denominator: string // <input type="number"> returns a string type.
  denominatorUnit: 'day' | 'week' | 'month' | 'year'
  lastResetAt: string // <b-form-datepicker/> returns a formatted string like 'yyyy-mm-dd'.
}

export type VuexTaskLists = VuexTaskList[]

@Module({ stateFactory: true, namespaced: true, name: 'taskListStore' })
export default class TaskListStore extends VuexModule {
  list: VuexTaskLists = []

  /**
   * 対象の TaskList を取得する（id 検索）
   */
  get findById() {
    return (id: string): VuexTaskList | undefined => {
      return this.list.find((taskList) => {
        return taskList.id === id
      })
    }
  }

  /**
   * 対象の TaskList の配列番号を取得する（id 検索）
   */
  get findIndexById() {
    return (id: string) => {
      return this.list.findIndex((taskList) => {
        return taskList.id === id
      })
    }
  }

  /**
   * 全 TaskList 内で、最大の TaskList.position の値
   */
  get currentMaxPosition() {
    return this.list.length
  }

  // =================================================
  // Initializer TaskList
  // =================================================

  /**
   * TaskList 一覧の消去、および編集中 TaskList データの消去
   */
  @Mutation
  clear() {
    this.list.splice(0)
  }

  /**
   * TaskList 一覧の position 値ソート
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
  // TaskList Controller
  // =================================================

  @Mutation
  private mutateToUpdate(payload: {
    targetIndex: number
    taskList: VuexTaskList
  }) {
    const { targetIndex, taskList } = payload
    Vue.set(this.list, targetIndex, taskList)
  }

  @Mutation
  private mutateToDelete(payload: { targetIndex: number }) {
    const { targetIndex } = payload
    this.list.splice(targetIndex, 1)
  }

  /**
   * 新規 TaskList をデータリストに追加する
   * @param payload { taskList } 新規追加する TaskList データオブジェクト
   */
  @Mutation
  add(payload: { taskList: VuexTaskList }) {
    const { taskList } = payload
    this.list.push(taskList)
  }

  /**
   * TaskList を更新する
   * @param payload { taskList } 更新後の TaskList データオブジェクト
   */
  @Action
  update(payload: { taskList: VuexTaskList }) {
    const { taskList } = payload
    const targetIndex = this.findIndexById(taskList.id)
    this.mutateToUpdate({ targetIndex, taskList })
  }

  /**
   * TaskList を削除する
   * @param payload { taskList } 削除対象の TaskList データオブジェクト
   */
  @Action
  delete(payload: { taskListId: string }) {
    const { taskListId } = payload
    const targetIndex = this.findIndexById(taskListId)
    this.mutateToDelete({ targetIndex })
  }
}
