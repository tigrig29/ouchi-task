import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({ stateFactory: true, namespaced: true, name: 'others' })
export default class Others extends VuexModule {
  hasSetAuthHandle: boolean = false
  hasGotLocalStorage: boolean = false

  @Mutation
  setAuthHandle() {
    this.hasSetAuthHandle = true
  }

  @Mutation
  doneToGetLocalStorage() {
    this.hasGotLocalStorage = true
  }
}
