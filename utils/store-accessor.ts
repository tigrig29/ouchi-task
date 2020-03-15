/* eslint-disable import/no-mutable-exports */

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import User from '~/store/user'
import CardStore from '~/store/cardStore'
import TaskStore from '~/store/taskStore'
import Others from '~/store/others'

let userStore: User
let cardStore: CardStore
let taskStore: TaskStore
let othersStore: Others

function initializeStores(store: Store<any>): void {
  userStore = getModule(User, store)
  cardStore = getModule(CardStore, store)
  taskStore = getModule(TaskStore, store)
  othersStore = getModule(Others, store)
}

export { initializeStores, userStore, cardStore, taskStore, othersStore }
