import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/auth'
import { getUserInfo } from '@/api/user'
import { setToken, removeToken, setUser, removeUser, getToken } from '@/utils/auth'
import { useCartStore } from './cart'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '')
  const userInfo = ref(null)
  const isLogin = computed(() => !!token.value)
  const role = computed(() => userInfo.value?.role || 'BUYER')
  const isSeller = computed(() => role.value === 'SELLER')
  const isAdmin = computed(() => role.value === 'ADMIN')
  const roleLabel = computed(() => ({ BUYER: '买家', SELLER: '卖家', ADMIN: '管理员' })[role.value] || '买家')

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
    } catch (error) {
      // Token 失效
      if (error?.response?.status === 401 || !getToken()) {
        logout()
      }
      throw error
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    removeToken()
    removeUser()
    // 同步清除购物车（本地重置，避免 API 调用的 401）
    const cartStore = useCartStore()
    cartStore.reset()
  }

  return { token, userInfo, isLogin, role, isSeller, isAdmin, roleLabel, login, register, fetchUserInfo, logout }
})
