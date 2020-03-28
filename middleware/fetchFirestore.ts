import { FireTaskList, FireTask } from '~/types/firestore'

import { userStore, taskListStore, taskStore } from '~/store'
import firestoreManager from '~/assets/libs/firestoreManager'
import vuexfire from '~/assets/libs/vuexfire'

export default async () => {
  const userId = userStore.id
  if (!userId) return

  // Vuex Store を初期化
  taskListStore.clear()
  taskStore.clear()

  // TaskLists の QuerySnapshot 取得（旧スキーマの cards も対象）。
  const [queryTaskLists, oldQueryCards] = await Promise.all([
    firestoreManager.taskList.docs(userId),
    firestoreManager.taskList.docs(userId, 'cards') // old schema
  ])
  const docsTaskList = [...queryTaskLists.docs, ...oldQueryCards.docs]

  // ループ内 await するため、Promise.all
  await Promise.all(
    // `TaskList` の DocumentQuerySnapshot の取得ループ
    docsTaskList.map(async (docTaskList) => {
      const taskListId = docTaskList.id

      // VuexTaskList へ変換し、VuexStore へ Add
      const vuexTaskList = vuexfire.taskList.convertFireToVuex(
        taskListId,
        docTaskList.data() as FireTaskList
      )
      taskListStore.add({ taskList: vuexTaskList })

      // tasks の QuerySnapshot 取得
      const queryTasks = await firestoreManager.task.docs(userId, taskListId)

      // `Task` の DocumentQuerySnapshot の取得ループ
      for (const docTask of queryTasks.docs) {
        // VuexTask へ変換し、VuexStore へ Add
        const vuexTask = vuexfire.task.convertFireToVuex(
          taskListId,
          docTask.id,
          docTask.data() as FireTask
        )
        taskStore.add({ task: vuexTask })
      }
    })
  )

  // `Card` -> `TaskList` にスキーマ変更したことにより、
  // Firestore の order だけでは完全にソートしきれなくなったので、
  // ソート処理する
  taskListStore.sortList()
  taskStore.sortList()
}
