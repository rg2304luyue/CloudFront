<template>
  <div class="page-container">
    <div class="result-card card">
      <!-- Loading -->
      <div v-if="loading" class="result-content">
        <el-icon :size="48" color="#9c9cb8" class="spin"><Loading /></el-icon>
        <h2>正在查询支付结果</h2>
        <p>请稍候...</p>
      </div>

      <!-- Success -->
      <div v-else-if="resultType === 'success'" class="result-content">
        <div class="result-icon success">
          <el-icon :size="48"><CircleCheckFilled /></el-icon>
        </div>
        <h2>支付成功</h2>
        <p>您的订单已支付成功，我们将尽快为您发货</p>
        <div class="result-actions">
          <button class="btn btn-primary" @click="$router.push('/order/list')">我的订单</button>
          <button class="btn btn-ghost" @click="$router.push('/')">返回首页</button>
        </div>
      </div>

      <!-- Pending -->
      <div v-else-if="resultType === 'pending'" class="result-content">
        <div class="result-icon pending">
          <el-icon :size="48"><Clock /></el-icon>
        </div>
        <h2>支付处理中</h2>
        <p>支付正在处理中，请稍后查看订单状态。如已扣款请勿重复支付。</p>
        <div class="result-actions">
          <button class="btn btn-primary" @click="$router.push('/order/list')">查看订单</button>
          <button class="btn btn-ghost" @click="$router.push('/')">返回首页</button>
        </div>
      </div>

      <!-- Fail -->
      <div v-else class="result-content">
        <div class="result-icon fail">
          <el-icon :size="48"><CircleCloseFilled /></el-icon>
        </div>
        <h2>{{ resultTitle }}</h2>
        <p>{{ resultDesc }}</p>
        <div class="result-actions">
          <button class="btn btn-primary" @click="$router.push('/order/list')">我的订单</button>
          <button class="btn btn-ghost" @click="$router.push('/')">返回首页</button>
        </div>
      </div>
    </div>
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
  max-width: 520px;
  margin: 60px auto;
  padding: 48px 40px;
  text-align: center;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-icon {
  width: 88px; height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.result-icon.success { background: #f0fdf6; color: #22c55e; }
.result-icon.pending { background: #fffbeb; color: #f59e0b; }
.result-icon.fail { background: #fef2f2; color: #ef4444; }

.result-content h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
.result-content p { font-size: 14px; color: var(--text-secondary); margin-bottom: 28px; line-height: 1.6; }

.result-actions { display: flex; gap: 10px; }

.spin { animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .result-card { padding: 32px 20px; margin: 32px auto; }
  .result-actions { flex-direction: column; width: 100%; }
  .result-actions .btn { width: 100%; justify-content: center; }
}
</style>
