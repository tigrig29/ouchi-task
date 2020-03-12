import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import firebase from '~/plugins/firebase'

@Module({ stateFactory: true, namespaced: true, name: 'user' })
export default class User extends VuexModule {
  duringAuthentication: boolean = false

  id: string | null = null
  name: string | null = null

  get isAuthenticated() {
    return !!this.id
  }

  @Mutation
  setId(id: string | null) {
    this.id = id
  }

  @Mutation
  setName(name: string | null) {
    this.name = name
  }

  @Action
  setUser(user: firebase.User | null) {
    const id = user ? user.uid : null
    const name = user ? user.displayName : null
    this.setId(id)
    this.setName(name)
    this.setDuringAuthentication(false)

    localStorage.setItem('vuex/user/id', JSON.stringify(this.id))
    localStorage.setItem('vuex/user/name', JSON.stringify(this.name))
  }

  @Mutation
  setDuringAuthentication(during: boolean) {
    this.duringAuthentication = during
  }

  @Action
  fetchUser() {
    const id = JSON.parse(localStorage.getItem('vuex/user/id') as string)
    const name = JSON.parse(localStorage.getItem('vuex/user/name') as string)
    this.setId(id)
    this.setName(name)
  }
}
