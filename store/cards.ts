import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { db } from '~/plugins/firebase'
import { Card } from '~/types/firestore'

@Module({ stateFactory: true, namespaced: true, name: 'cards' })
export default class Cards extends VuexModule {
  list: Card[] = []

  @Mutation
  clearList() {
    this.list.splice(0)
  }

  @Mutation
  addCard(card: Card) {
    this.list.push(card)
  }

  @Action
  fetchCards(userId) {
    this.clearList()
    db.doc(`users/${userId}`)
      .collection('cards')
      .get()
      .then((querySnapshot) => {
        console.log('fetch cards')
        querySnapshot.forEach((doc) => {
          this.addCard(doc.data() as Card)
        })
      })
  }
}
