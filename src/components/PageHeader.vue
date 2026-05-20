<template>
  <div class="page-head">
    <div class="head-left">
      <button v-if="showBack" class="back-btn" @click="goBack">
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </button>
      <div>
        <h2 class="head-title">{{ title }}</h2>
        <p v-if="subtitle" class="head-sub">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="head-right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  backTo: { type: [String, Object], default: null }
})

const router = useRouter()

function goBack() {
  if (props.backTo) {
    router.push(props.backTo)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.head-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.back-btn {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--transition-fast);
}
.back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.head-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.3px;
}

.head-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 3px;
}

.head-right {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
</style>
