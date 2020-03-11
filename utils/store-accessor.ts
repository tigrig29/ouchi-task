import { Store } from 'vuex'
// import { getModule } from 'vuex-module-decorators'

// let todosStore: Todos

function initializeStores(store: Store<any>): void {
  // todosStore = getModule(Todos, store)
  console.log(store)
}

export { initializeStores /*, todosStore */ }
