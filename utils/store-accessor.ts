/* eslint-disable import/no-mutable-exports */

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import User from '~/store/user'
import TaskListStore from '~/store/taskListStore'
import TaskListEditor from '~/store/taskListEditor'
import TaskStore from '~/store/taskStore'
import Others from '~/store/others'

let userStore: User
let taskListStore: TaskListStore
let taskListEditor: TaskListEditor
let taskStore: TaskStore
let othersStore: Others

function initializeStores(store: Store<any>): void {
  userStore = getModule(User, store)
  taskListStore = getModule(TaskListStore, store)
  taskListEditor = getModule(TaskListEditor, store)
  taskStore = getModule(TaskStore, store)
  othersStore = getModule(Others, store)
}

export {
  initializeStores,
  userStore,
  taskListStore,
  taskListEditor,
  taskStore,
  othersStore
}
