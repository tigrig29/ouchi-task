/* eslint-disable import/no-mutable-exports */

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import User from '~/store/user'

let userStore: User

function initializeStores(store: Store<any>): void {
  userStore = getModule(User, store)
}

export { initializeStores, userStore }
