import axios from 'axios'
import { getToken, removeToken } from './auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

let handling401 = false

async function handleUnauthorized() {
  if (handling401) return
  handling401 = true
  removeToken()
  window.dispatchEvent(new Event('cloud-auth-expired'))

  if (router.currentRoute.value.name !== 'Login') {
    try {
      await router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
    } catch {
      // 路由跳转失败（重复导航等）忽略，保证标志位复位
    } finally {
      handling401 = false
    }
  } else {
    handling401 = false
  }
}

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// 请求拦截器 — 自动携带 Token
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 — 统一错误处理
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      // 仅 401 认证失败时清除 token
      if (res.code === 401) {
        handleUnauthorized()
      }
      const error = new Error(res.message)
      error.code = res.code
      return Promise.reject(error)
    }
    return res
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        handleUnauthorized()
      } else if (status === 403) {
        ElMessage.error('没有访问权限')
      } else if (status === 500) {
        ElMessage.error('服务内部错误')
      } else {
        ElMessage.error(`请求失败: ${status}`)
      }
    } else {
      ElMessage.error('网络异常，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request
