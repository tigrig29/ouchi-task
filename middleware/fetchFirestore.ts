import { userStore, cardStore, taskStore } from '~/store'
import { Card, Task } from '~/types/firestore'

export default async () => {
  const userId = userStore.id

  if (!userId) return

  cardStore.clearCards()
  taskStore.clearTasks()

  const queryCards = await cardStore
    .cardsRef(userId)
    .orderBy('position')
    .get()

  for (const docCard of queryCards.docs) {
    const cardId = docCard.id
    const card: Card = docCard.data() as Card
    cardStore.addCard({ cardId, card })

    const queryTasks = await taskStore
      .tasksRef(userId, cardId)
      .orderBy('position')
      .get()

    for (const docTask of queryTasks.docs) {
      const task: Task = { parentCardId: cardId, ...(docTask.data() as Task) }
      taskStore.addTask({ taskId: docTask.id, task })
    }
  }
}
