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
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,.05);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast), transform var(--transition-fast);
}
.back-btn:hover { background: rgba(0,0,0,.09); }
.back-btn:active { transform: scale(.94); }

.head-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.025em;
  line-height: 1.15;
}

.head-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.head-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .head-title { font-size: 24px; }
}
</style>
