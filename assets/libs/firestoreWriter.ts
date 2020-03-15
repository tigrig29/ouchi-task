import { firestore } from 'firebase'
import { taskStore } from '~/store'
import { Task } from '~/types/firestore'

export default {
  addTask: async (
    userId: string,
    cardId: string,
    title: string,
    position: number
  ) => {
    const task: Task = {
      parentCardId: cardId,
      title,
      position,
      done: false,
      updatedAt: firestore.Timestamp.now()
    }
    const taskRef = await taskStore.tasksRef(userId, cardId).add(task)

    return { taskId: taskRef.id, task }
  },
  updateTask: async (userId: string, taskId: string) => {
    const task = taskStore.taskList[taskId]

    const taskRef = taskStore.tasksRef(userId, task.parentCardId).doc(taskId)
    await taskRef.update({
      title: task.title,
      done: task.done,
      updatedAt: firestore.Timestamp.now()
    })
  },
  deleteTask: async (userId: string, taskId: string) => {
    const taskRef = taskStore
      .tasksRef(userId, taskStore.taskList[taskId].parentCardId)
      .doc(taskId)
    await taskRef.delete()
  }
}
