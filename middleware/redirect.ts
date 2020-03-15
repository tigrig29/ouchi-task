import { Context } from '@nuxt/types'
import { userStore } from '~/store'

const authPages: string[] = ['index']
const notAuthPages: string[] = ['login']

export default ({ route, redirect }: Context) => {
  const currentRouteName: string = route.name || ''

  if (userStore.isAuthenticated) {
    // 認証済み ＆ ログインページへのアクセス → account
    if (notAuthPages.includes(currentRouteName)) redirect('/')
    return
  }

  // 非認証 ＆ 認証対象ページへのアクセス → login
  if (authPages.includes(currentRouteName)) redirect('/login')
}
