<template>
  <div class="loading">
    <div class="spinner"></div>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({ text: { type: String, default: '加载中...' } })
</script>

<style scoped>
.loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .8s linear infinite; margin-bottom: 16px; }
.loading-text { font-size: 13px; color: var(--text-muted); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
