/* eslint-disable import/no-mutable-exports */

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import User from '~/store/user'
import TaskStore from '~/store/taskStore'
import Others from '~/store/others'

let userStore: User
let taskStore: TaskStore
let othersStore: Others

function initializeStores(store: Store<any>): void {
  userStore = getModule(User, store)
  taskStore = getModule(TaskStore, store)
  othersStore = getModule(Others, store)
}

export { initializeStores, userStore, taskStore, othersStore }
