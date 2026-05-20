<template>
  <div class="page-container">
    <div class="result-card" v-if="!loading">
      <div class="result-icon" :class="resultType">
        <el-icon :size="48" v-if="resultType === 'success'"><CircleCheckFilled /></el-icon>
        <el-icon :size="48" v-else-if="resultType === 'pending'"><Clock /></el-icon>
        <el-icon :size="48" v-else><CircleCloseFilled /></el-icon>
      </div>
      <h2 class="result-title">{{ resultTitle }}</h2>
      <p class="result-desc">{{ resultDesc }}</p>
      <div class="result-actions">
        <button class="primary-btn" @click="$router.push('/order/list')">我的订单</button>
        <button class="secondary-btn" @click="$router.push('/')">返回首页</button>
      </div>
    </div>
    <LoadingState v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPaymentByOrderNo } from '@/api/payment'
import LoadingState from '@/components/LoadingState.vue'

const route = useRoute()
const loading = ref(true)
const resultType = ref('pending')
const resultTitle = ref('')
const resultDesc = ref('')

onMounted(async () => {
  const orderNo = route.query.orderNo
  if (!orderNo) {
    resultType.value = 'fail'
    resultTitle.value = '参数错误'
    resultDesc.value = '未找到订单号，无法查询支付结果'
    loading.value = false
    return
  }
  try {
    const res = await getPaymentByOrderNo(orderNo)
    if (res.data && res.data.status === 1) {
      resultType.value = 'success'
      resultTitle.value = '支付成功'
      resultDesc.value = '您的订单已支付成功，我们将尽快为您发货'
    } else {
      resultType.value = 'pending'
      resultTitle.value = '支付处理中'
      resultDesc.value = '支付正在处理中，请稍后查看订单状态。如已扣款请勿重复支付。'
    }
  } catch {
    resultType.value = 'pending'
    resultTitle.value = '支付处理中'
    resultDesc.value = '请前往「我的订单」查看支付状态'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.result-card {
  max-width: 480px;
  margin: 60px auto;
  text-align: center;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 48px 32px;
  border: 1px solid var(--border);
}
.result-icon { margin-bottom: 20px; }
.result-icon.success { color: #389e0d; }
.result-icon.pending { color: #d46b08; }
.result-icon.fail { color: #cf1322; }
.result-title { font-size: 20px; font-weight: 600; margin-bottom: 12px; }
.result-desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 32px; line-height: 1.6; }
.result-actions { display: flex; gap: 12px; justify-content: center; }
.primary-btn {
  padding: 10px 28px;
  border: none;
  border-radius: 6px;
  background: var(--primary, #409eff);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
.secondary-btn {
  padding: 10px 28px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}
</style>
