import { firebase } from '~/plugins/firebase'
import { userStore, othersStore } from '~/store'

export default () => {
  if (othersStore.hasSetAuthHandle) return

  firebase.auth().onAuthStateChanged(
    (user) => {
      console.log('auth state changed')

      // ログイン時、既に localStorage からユーザーデータを取得できている場合は終了
      if (user && userStore.isAuthenticated) return

      userStore.setUser({
        id: user?.uid
      })
    },
    (error) => {
      console.log(error)
      alert('some error has occurred')
    }
  )

  othersStore.setAuthHandle()
}
