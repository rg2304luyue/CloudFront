<template>
  <div id="app-root">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/user'
import { isLoggedIn } from '@/utils/auth'

const userStore = useUserStore()

function handleAuthExpired() {
  userStore.logout()
}

onMounted(() => {
  window.addEventListener('cloud-auth-expired', handleAuthExpired)
  if (isLoggedIn()) {
    userStore.fetchUserInfo().catch(() => {})
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('cloud-auth-expired', handleAuthExpired)
})
</script>

<style>
#app-root {
  width: 100%;
  min-height: 100vh;
}
</style>
