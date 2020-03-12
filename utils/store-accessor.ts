/* eslint-disable import/no-mutable-exports */

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import User from '~/store/user'
import Others from '~/store/others'

let userStore: User
let othersStore: Others

function initializeStores(store: Store<any>): void {
  userStore = getModule(User, store)
  othersStore = getModule(Others, store)
}

export { initializeStores, userStore, othersStore }
