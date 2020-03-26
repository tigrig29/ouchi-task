import { taskStore } from '~/store'
import { FireTaskList, FireTask } from '~/types/firestore'
import { db } from '~/plugins/firebase'

const firestoreManager = {
  // =================================================
  // TaskList
  // =================================================
  taskList: {
    // -----------------------------------------------
    // Firestore References
    // -----------------------------------------------
    /**
     * users/{userId}/taskLists コレクションの Reference
     * @param userId users/ { userId } <- this /taskLists
     * @param collectionKey スキーマ変更前の旧コレクション名などを指定したい場合に使用（例：'cards' -> users/{userId}/cards ）
     */
    get collectionRef() {
      return (userId: string, collectionKey: string = 'taskLists') => {
        return db.doc(`users/${userId}`).collection(collectionKey)
      }
    },
    /**
     * users/{userId}/taskLists/{taskListId} ドキュメントの Reference
     * @param userId users/ { userId } <- this /taskLists/{taskListId}
     * @param taskListId users/{userId}/taskLists/ { taskListId } <- this
     */
    get docRef() {
      return async (userId: string, taskListId: string) => {
        let docRef = this.collectionRef(userId).doc(taskListId)

        // users/${userId}/taskLists/${taskListId} が、
        // 存在しない場合は、旧スキーマ `cards/${taskListId}` で呼び出す
        const exists = (await docRef.get()).exists
        if (!exists)
          docRef = this.collectionRef(userId, 'cards').doc(taskListId)

        return docRef
      }
    },
    /**
     * users/{userId}/taskLists コレクションの全ドキュメント
     * @param userId users/ { userId } <- this /taskLists
     * @param collectionKey スキーマ変更前の旧コレクション名などを指定したい場合に使用（例：'cards' -> users/{userId}/cards ）
     */
    get docs() {
      return (userId: string, collectionKey: string = 'taskLists') => {
        return this.collectionRef(userId, collectionKey)
          .orderBy('position')
          .get()
      }
    },

    // -----------------------------------------------
    // Mutations
    // -----------------------------------------------
    /**
     * `user/{userId}/taskList/{自動 ID}` に新規 TaskList を追加する
     * @param userId ログインユーザー ID
     * @param taskList 新規追加する TaskList オブジェクト
     */
    async add(userId: string, taskList: FireTaskList) {
      const taskListRef = await this.collectionRef(userId).add(taskList)
      return taskListRef.id
    },
    /**
     * `user/{userId}/taskList/{taskListId}` の TaskList を更新する
     * @param userId ログインユーザー ID
     * @param taskListId 更新対象の TaskList ID
     * @param taskList 更新後の値（ TaskList ）
     */
    async update(userId: string, taskListId: string, taskList: FireTaskList) {
      const docRef = await this.docRef(userId, taskListId)
      await docRef.update(taskList)
    },
    /**
     * `user/{userId}/taskList/{taskListId}` の TaskList を削除する（サブコレクション `tasks` も削除）
     * @param userId ログインユーザー ID
     * @param taskListId 削除対象の TaskList ID
     */
    async delete(userId: string, taskListId: string) {
      // サブコレクション tasks 削除
      const promises: Promise<void>[] = []
      for (const task of taskStore.listFilteredByParentId(taskListId)) {
        promises.push(firestoreManager.task.delete(userId, taskListId, task.id))
      }
      await Promise.all(promises)

      // taskList 削除
      const taskListRef = await this.docRef(userId, taskListId)
      await taskListRef.delete()
    }
  },

  // =================================================
  // Task
  // =================================================
  task: {
    // -----------------------------------------------
    // Firestore References
    // -----------------------------------------------
    /**
     * users/{userId}/taskLists/{taskListId}/tasks コレクションの Reference
     * @param userId users/ { userId } <- this /taskLists/{taskListId}/tasks
     * @param taskListId users/{userId}/taskLists/ { taskListId } <- this /tasks
     */
    get collectionRef() {
      return async (userId: string, taskListId: string) => {
        const docRef = await firestoreManager.taskList.docRef(
          userId,
          taskListId
        )
        return docRef.collection('tasks')
      }
    },
    /**
     * users/{userId}/taskLists/{taskListId}/tasks/{taskId} コレクションの Reference
     * @param userId users/ { userId } <- this /taskLists/{taskListId}/tasks/{taskId}
     * @param taskListId users/{userId}/taskLists/ { taskListId } <- this /tasks/{taskId}
     * @param taskId users/{userId}/taskLists/{taskListId}/tasks/{ taskId } <- this
     */
    get docRef() {
      return async (userId: string, taskListId: string, taskId: string) => {
        return (await this.collectionRef(userId, taskListId)).doc(taskId)
      }
    },
    /**
     * users/{userId}/taskLists/{taskListId}/tasks コレクションの全ドキュメント
     * @param userId users/ { userId } <- this /taskLists/{taskListId}/tasks
     * @param taskListId users/{userId}/taskLists/ { taskListId } <- this /tasks
     */
    get docs() {
      return async (userId: string, taskListId: string) => {
        return (await this.collectionRef(userId, taskListId))
          .orderBy('position')
          .get()
      }
    },

    // -----------------------------------------------
    // Mutations
    // -----------------------------------------------
    /**
     * `user/{userId}/taskList/{taskListId}/tasks/{自動 ID}` に新規 Task を追加する
     * @param userId ログインユーザー ID
     * @param taskListId 親 TaskList の ID
     * @param task 新規追加する Task オブジェクト
     */
    async add(userId: string, taskListId: string, task: FireTask) {
      const collectionRef = await this.collectionRef(userId, taskListId)
      const taskRef = await collectionRef.add(task)
      return taskRef.id
    },
    /**
     * `user/{userId}/taskList/{taskListId}/tasks/{taskId}` の Task を更新する
     * @param userId ログインユーザー ID
     * @param taskListId 更新対象の TaskList ID
     * @param taskId 更新対象の Task ID
     * @param task 更新後の値（ Task ）
     */
    async update(
      userId: string,
      taskListId: string,
      taskId: string,
      task: FireTask
    ) {
      const docRef = await this.docRef(userId, taskListId, taskId)
      await docRef.update(task)
    },
    /**
     * `user/{userId}/taskList/{taskListId}/tasks/{taskId}` の Task を削除する
     * @param userId ログインユーザー ID
     * @param taskListId 更新対象の TaskList ID
     * @param taskId 更新対象の Task ID
     */
    async delete(userId: string, taskListId: string, taskId: string) {
      const docRef = await this.docRef(userId, taskListId, taskId)
      await docRef.delete()
    }
  }
}

export default firestoreManager
