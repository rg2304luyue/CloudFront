import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/auth'
import { getUserInfo } from '@/api/user'
import { setToken, removeToken, setUser, removeUser, getToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '')
  const userInfo = ref(null)
  const isLogin = computed(() => !!token.value)

  async function login(username, password) {
    const res = await loginApi(username, password)
    token.value = res.data
    setToken(res.data)
  }

  async function register(username, password, nickname) {
    await registerApi(username, password, nickname)
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const res = await getUserInfo()
      userInfo.value = res.data
      setUser(res.data)
    } catch {
      // Token 失效
      logout()
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    removeToken()
    removeUser()
  }

  return { token, userInfo, isLogin, login, register, fetchUserInfo, logout }
})
