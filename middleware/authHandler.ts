import firebase from '~/plugins/firebase'
import { userStore, othersStore } from '~/store'

export default () => {
  if (othersStore.hasSetAuthHandle) return

  firebase.auth().onAuthStateChanged(
    (user) => {
      console.log('auth state changed')
      userStore.setUser(user)
    },
    (error) => {
      console.log(error)
      alert('some error has occurred')
    }
  )

  othersStore.setAuthHandle()
}
