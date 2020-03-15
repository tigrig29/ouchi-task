import { firestore } from 'firebase'
import { taskStore } from '~/store'

export default {
  updateTask: async (userId: string, taskId: string) => {
    const task = taskStore.taskList[taskId]

    const taskRef = taskStore.tasksRef(userId, task.parentCardId).doc(taskId)
    await taskRef.update({
      title: task.title,
      done: task.done,
      updatedAt: firestore.Timestamp.now()
    })
  }
}
