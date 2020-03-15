import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { firestore } from 'firebase'
import { db } from '~/plugins/firebase'
import { CardList, Card } from '~/types/firestore'

@Module({ stateFactory: true, namespaced: true, name: 'cardStore' })
export default class CardStore extends VuexModule {
  cardList: CardList = {}

  get cardsRef() {
    return (
      userId: string
    ): firestore.CollectionReference<firestore.DocumentData> => {
      return db.doc(`users/${userId}`).collection('cards')
    }
  }

  @Mutation
  clearCards() {
    this.cardList = {}
  }

  @Mutation
  addCard(payload: { cardId: string; card: Card }) {
    const { cardId, card } = payload
    this.cardList[cardId] = card
  }
}
