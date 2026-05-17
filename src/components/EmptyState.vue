<template>
  <div class="empty-state">
    <el-icon :size="iconSize" :color="iconColor"><component :is="icon" /></el-icon>
    <p class="empty-text">{{ description }}</p>
    <el-button v-if="showAction" type="primary" @click="$emit('action')">
      {{ actionText }}
    </el-button>
  </div>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' },
  icon: { type: String, default: 'FolderOpened' },
  iconSize: { type: Number, default: 64 },
  iconColor: { type: String, default: '#c0c4cc' },
  showAction: { type: Boolean, default: false },
  actionText: { type: String, default: '去逛逛' }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}
.empty-text {
  margin: 16px 0 24px;
  font-size: 14px;
  color: #909399;
}
</style>
