import { userStore, taskListStore, taskStore } from '~/store'
import { FireTaskList, FireTask } from '~/types/firestore'
import firestoreManager from '~/assets/libs/firestoreManager'

export default async () => {
  const userId = userStore.id
  if (!userId) return

  // Vuex Store を初期化
  taskListStore.clear()
  taskStore.clear()

  // taskLists の QuerySnapshot 取得（旧スキーマの cards も対象）。
  const [queryTaskLists, oldQueryCards] = await Promise.all([
    firestoreManager.taskList.docs(userId),
    firestoreManager.taskList.docs(userId, 'cards') // old schema
  ])

  // users/{userId}/taskLists or cards/{taskListId} 以下の
  // DocumentSnapshot をループ取得
  for (const docTaskList of [...queryTaskLists.docs, ...oldQueryCards.docs]) {
    // TaskList のドキュメント ID
    const taskListId = docTaskList.id

    // Firestore の TaskList
    const fireTaskList: FireTaskList = docTaskList.data() as FireTaskList
    // Vuex の TaskList へ変換
    const vuexTaskList = firestoreManager.taskList.convertFireToVuex(
      taskListId,
      fireTaskList
    )

    // Vuex へ Add
    taskListStore.add({ taskList: vuexTaskList })

    // tasks の QuerySnapshot 取得
    const queryTasks = await firestoreManager.task.docs(userId, taskListId)

    // users/{userId}/taskLists or cards/{taskListId}/tasks/{taskId} 以下の
    // DocumentSnapshot をループ取得
    for (const docTask of queryTasks.docs) {
      // Firestore の TaskList
      const fireTask: FireTask = docTask.data() as FireTask
      // Vuex の TaskList へ変換
      const vuexTask = firestoreManager.task.convertFireToVuex(
        taskListId,
        docTask.id,
        fireTask
      )

      // Vuex へ Add
      taskStore.add({ task: vuexTask })
    }
  }

  // `Card` -> `TaskList` にスキーマ変更したことにより、
  // Firestore の order だけでは完全にソートしきれなくなったので、
  // ソート処理する
  taskListStore.sortList()
  taskStore.sortList()
}
