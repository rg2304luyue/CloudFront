<template>
  <div class="empty">
    <div class="empty-icon-wrapper">
      <el-icon :size="48" color="#c7c7cc"><component :is="icon" /></el-icon>
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
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 88px 20px; text-align: center; }
.empty-icon-wrapper { width: 88px; height: 88px; border-radius: 50%; background: rgba(0,0,0,.04); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.empty-text { font-size: 15px; color: var(--text-secondary); margin-bottom: 22px; }
.empty-btn { padding: 9px 22px; border: none; border-radius: var(--radius-full); background: var(--primary); color: #fff; cursor: pointer; font-size: 14px; font-weight: 500; transition: background var(--transition-fast), transform var(--transition-fast); }
.empty-btn:hover { background: var(--primary-hover); }
.empty-btn:active { transform: scale(.97); }
</style>
