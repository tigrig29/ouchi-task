import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

import { FireUser } from '~/types/firestore'

export type VuexUser = Partial<FireUser> & {
  id?: string
  lastLoginAt?: Date
}

@Module({ stateFactory: true, namespaced: true, name: 'user' })
export default class User extends VuexModule {
  duringAuthentication: boolean = false

  id: VuexUser['id'] = ''

  get isAuthenticated() {
    return !!this.id
  }

  @Mutation
  private setData(user: Partial<VuexUser>) {
    this.id = user.id
  }

  @Mutation
  setDuringAuthentication(during: boolean) {
    this.duringAuthentication = during
  }

  @Action
  setUser(user: Partial<VuexUser>) {
    this.setData(user)

    localStorage.setItem('vuex/user/id', JSON.stringify(this.id))
  }

  @Action
  fetchUser() {
    const id = JSON.parse(localStorage.getItem('vuex/user/id') as string)
    this.setData({ id })
  }
}
