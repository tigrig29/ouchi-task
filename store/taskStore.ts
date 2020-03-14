import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { firestore } from 'firebase'
import { db } from '~/plugins/firebase'
import { Card, Task } from '~/types/firestore'

@Module({ stateFactory: true, namespaced: true, name: 'taskStore' })
export default class TaskStore extends VuexModule {
  cards: Card[] = []

  private get cardsRef() {
    return (
      userId: string
    ): firestore.CollectionReference<firestore.DocumentData> => {
      return db.doc(`users/${userId}`).collection('cards')
    }
  }

  private get tasksRef() {
    return (
      userId: string,
      cardId
    ): firestore.CollectionReference<firestore.DocumentData> => {
      return db.doc(`users/${userId}/cards/${cardId}`).collection('tasks')
    }
  }

  private get getTasks() {
    return async (userId: string, cardId: string): Promise<Task[]> => {
      const tasks: Task[] = []

      const queryTasks = await this.tasksRef(userId, cardId).get()

      return new Promise((resolve) => {
        queryTasks.forEach((docTask) => {
          const task: Task = {
            id: docTask.id,
            ...(docTask.data() as Task)
          }
          tasks.push(task)
        })

        resolve(tasks)
      })
    }
  }

  get cardsSortedByPosition() {
    return [...this.cards].sort((a, b) => {
      return a.position - b.position
    })
  }

  @Mutation
  clearCards() {
    this.cards.splice(0)
  }

  @Mutation
  addCard(card: Card) {
    this.cards.push(card)
  }

  @Action
  async fetch(userId) {
    this.clearCards()

    const queryCards = await this.cardsRef(userId).get()

    queryCards.forEach(async (docCard) => {
      const id: string = docCard.id
      const tasks: Task[] = await this.getTasks(userId, docCard.id)

      const card: Card = { id, ...(docCard.data() as Card), tasks }

      this.addCard(card)
    })
  }
}
