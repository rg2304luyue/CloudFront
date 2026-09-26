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
.loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 88px 20px; }
.spinner { width: 28px; height: 28px; border: 2.5px solid rgba(0,0,0,.08); border-top-color: var(--text-secondary); border-radius: 50%; animation: spin .9s linear infinite; margin-bottom: 14px; }
.loading-text { font-size: 13px; color: var(--text-muted); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
