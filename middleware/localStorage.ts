import { userStore, othersStore } from '~/store'

export default () => {
  if (othersStore.hasGotLocalStorage) return

  userStore.fetchUser()
  othersStore.doneToGetLocalStorage()
}
