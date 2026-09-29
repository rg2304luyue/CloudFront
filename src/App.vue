<template>
  <div id="app-root">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { getToken } from '@/utils/auth'
import router from '@/router'

const userStore = useUserStore()
const cartStore = useCartStore()

function handleAuthExpired() {
  userStore.logout()
}

// 多标签页同步：其他标签页登出/切换账号时同步本页登录态
function handleStorage(e) {
  if (e.key && e.key !== 'cloud_token') return
  const token = getToken()
  if (!token) {
    if (!userStore.isLogin) return
    userStore.logout()
    if (router.currentRoute.value.name !== 'Login') {
      router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } }).catch(() => {})
    }
  } else if (token !== userStore.token) {
    // 其他标签页切换了账号：同步 token 并重新拉取用户信息
    userStore.token = token
    userStore.userInfo = null
    cartStore.reset()
    userStore.fetchUserInfo().catch(() => {})
  }
}

onMounted(() => {
  window.addEventListener('cloud-auth-expired', handleAuthExpired)
  window.addEventListener('storage', handleStorage)
})

onBeforeUnmount(() => {
  window.removeEventListener('cloud-auth-expired', handleAuthExpired)
  window.removeEventListener('storage', handleStorage)
})
</script>

<style>
#app-root {
  width: 100%;
  min-height: 100vh;
}
</style>
