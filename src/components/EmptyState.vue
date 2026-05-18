<template>
  <div class="empty">
    <div class="empty-icon-wrapper">
      <el-icon :size="48" color="#d1d5db"><component :is="icon" /></el-icon>
    </div>
    <p class="empty-text">{{ description }}</p>
    <button v-if="showAction" class="empty-btn" @click="$emit('action')">{{ actionText }}</button>
  </div>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' },
  icon: { type: String, default: 'FolderOpened' },
  showAction: { type: Boolean, default: false },
  actionText: { type: String, default: '去逛逛' }
})
defineEmits(['action'])
</script>

<style scoped>
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; }
.empty-icon-wrapper { width: 96px; height: 96px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.empty-text { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; }
.empty-btn { padding: 8px 24px; border: 1px solid var(--border); border-radius: 6px; background: #fff; color: var(--text); cursor: pointer; font-size: 13px; transition: all .15s; }
.empty-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
</style>
