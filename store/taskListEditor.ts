import Vue from 'vue'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

import { FireTaskList } from '~/types/firestore'

import { taskListStore } from '~/utils/store-accessor'
import date from '~/assets/libs/date'
import vuexfire from '~/assets/libs/vuexfire'

export interface VuexTaskList {
  id: string
  title: string
  position: number
  denominator: string // <input type="number"> returns a string type.
  denominatorUnit: 'day' | 'week' | 'month' | 'year'
  lastResetAt: string // <b-form-datepicker/> returns a formatted string like 'yyyy-mm-dd'.
}

export type VuexTaskLists = VuexTaskList[]

@Module({ stateFactory: true, namespaced: true, name: 'taskListEditor' })
export default class TaskListEditor extends VuexModule {
  taskList: Partial<VuexTaskList> = {}

  // =================================================
  // Validation
  // =================================================

  /**
   * TaskList の各入力 Form のバリデーション
   */
  get validState(): { [N in keyof Required<FireTaskList>]: boolean } {
    const { title, denominator, denominatorUnit, lastResetAt } = this.taskList
    return {
      title: title ? title.length > 0 : false,
      position: true, // エディターで position は編集しない
      denominator: denominator ? parseInt(denominator) > 0 : false,
      denominatorUnit: !!denominatorUnit,
      lastResetAt: !!lastResetAt
    }
  }

  /**
   * this.validState の title, position, ... 全パラメータが true か判定
   */
  get validStateAll(): boolean {
    const {
      title,
      position,
      denominator,
      denominatorUnit,
      lastResetAt
    } = this.validState
    return title && position && denominator && denominatorUnit && lastResetAt
  }

  // =================================================
  // Editor value changed actions
  // =================================================

  /**
   * 編集 TaskList データを初期化
   * @param taskListId 指定 → 対象の TaskList データで初期化、非指定 → 新規追加テンプレートで初期化
   */
  @Mutation
  init(taskListId?: string) {
    const editTargetTaskList = taskListId
      ? { ...taskListStore.findById(taskListId) }
      : {
          id: undefined,
          title: undefined,
          position: taskListStore.currentMaxPosition + 1,
          denominator: '1',
          denominatorUnit: 'day',
          lastResetAt: date.pickUpDate(new Date())
        }
    Vue.set(this, 'taskList', editTargetTaskList)
  }

  /**
   * 編集 TaskList の各値を更新
   * @param payload.key 更新対象のプロパティ名
   * @param payload.value 値
   */
  @Mutation
  updateValues(payload: { key: string; value: any }) {
    const { key, value } = payload
    this.taskList[key] = value
  }

  // =================================================
  // Editor button actions
  // =================================================

  /**
   * 『保存』処理： TaskList の更新、または追加処理
   */
  @Action
  async save() {
    // 編集中なら update, 新規なら add
    if (this.taskList.id) await this.pushToUpdate()
    else await this.pushToAdd()
  }

  // =================================================
  // To update TaskList
  // =================================================

  /**
   * 編集中 TaskList を、VuexStore, Firestore へ Add
   */
  @Action
  async pushToAdd() {
    // Vuex, Firestore の両方で Add
    await vuexfire.taskList.addBoth(this.taskList as VuexTaskList)
  }

  /**
   * 編集中 TaskList を、VuexStore, Firestore へ Update
   */
  @Action
  async pushToUpdate() {
    // Vuex, Firestore 両方更新
    await vuexfire.taskList.updateBoth(this.taskList as VuexTaskList)
  }

  /**
   * 編集中 TaskList 、VuexStore, Firestore で Delete
   */
  @Action
  async pushToDelete() {
    // Vuex, Firestore 両方削除
    await vuexfire.taskList.deleteBoth(this.taskList as VuexTaskList)
  }
}
