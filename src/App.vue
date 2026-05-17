<template>
  <div id="app-root">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { isLoggedIn } from '@/utils/auth'

const userStore = useUserStore()

onMounted(() => {
  if (isLoggedIn()) {
    userStore.fetchUserInfo()
  }
})
</script>

<style>
#app-root {
  width: 100%;
  min-height: 100vh;
}
</style>
