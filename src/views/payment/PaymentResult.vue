<template>
  <div class="page-container">
    <div class="result-card card">
      <!-- Loading -->
      <div v-if="loading" class="result-content">
        <el-icon :size="48" color="#86868b" class="spin"><Loading /></el-icon>
        <h2>正在查询支付结果</h2>
        <p>请稍候...</p>
      </div>

      <!-- Success -->
      <div v-else-if="resultType === 'success'" class="result-content">
        <div class="result-icon success">
          <el-icon :size="48"><CircleCheckFilled /></el-icon>
        </div>
        <h2>支付成功</h2>
        <p>支付已确认，订单状态已同步。您可以前往订单页面查看最新进度。</p>
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
        <h2>{{ paymentConfirmed ? '支付已确认，订单同步中' : '支付处理中' }}</h2>
        <p>{{ paymentConfirmed ? '款项已确认，请勿重复支付。正在等待订单状态同步。' : '支付正在处理中，请稍后查看订单状态。如已扣款请勿重复支付。' }}</p>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getPaymentByOrderNo } from '@/api/payment'
import { getOrderByNo } from '@/api/order'
import { ORDER_STATUS } from '@/constants/orderStatus'

const route = useRoute()
const loading = ref(true)
const resultType = ref('pending')
const resultTitle = ref('')
const resultDesc = ref('')
const paymentConfirmed = ref(false)
const MAX_POLLS = 20 // 最多轮询 20 次（60 秒），防止无限轮询
let pollTimer = null
let pollCount = 0
let polling = false
let destroyed = false

async function checkPayment() {
  if (polling || destroyed) return
  pollTimer = null

  const orderNo = route.query.orderNo
  if (!orderNo) {
    resultType.value = 'fail'
    resultTitle.value = '参数错误'
    resultDesc.value = '未找到订单号，无法查询支付结果'
    loading.value = false
    return
  }

  if (pollCount >= MAX_POLLS) {
    resultType.value = 'fail'
    resultTitle.value = '支付超时'
    resultDesc.value = '支付处理时间过长，请前往「我的订单」查看支付状态'
    loading.value = false
    return
  }

  polling = true
  pollCount++
  try {
    const res = paymentConfirmed.value ? null : await getPaymentByOrderNo(orderNo)
    if (destroyed) return
    const status = paymentConfirmed.value ? 1 : Number(res.data?.status)
    if (status === 1) {
      paymentConfirmed.value = true
      const orderRes = await getOrderByNo(orderNo)
      if (destroyed) return
      const orderStatus = Number(orderRes.data?.status)
      if ([ORDER_STATUS.PAID, ORDER_STATUS.SHIPPED, ORDER_STATUS.COMPLETED].includes(orderStatus)) {
        resultType.value = 'success'
        stopPolling()
      } else if (orderStatus === ORDER_STATUS.CANCELLED) {
        resultType.value = 'exception'
        resultTitle.value = '款项已确认，但订单已取消'
        resultDesc.value = '请勿重复支付，请联系管理员核实款项。当前尚未确认退款完成。'
        stopPolling()
      } else {
        resultType.value = 'pending'
      }
    } else if (status === 2) {
      resultType.value = 'fail'
      resultTitle.value = '交易已关闭'
      resultDesc.value = '该笔支付已关闭，请回到订单页面查看或重新下单。'
      stopPolling()
    } else {
      resultType.value = 'pending'
      resultTitle.value = '支付处理中'
      resultDesc.value = '支付正在处理中，请稍后查看订单状态。如已扣款请勿重复支付。'
    }
  } catch {
    // 网络错误不改变状态，继续轮询直到达到上限
    resultType.value = 'pending'
    if (paymentConfirmed.value) {
      // 款项已确认，保持"已确认"文案，不退化为"支付处理中"
      resultTitle.value = '支付已确认，订单同步中'
      resultDesc.value = '款项已确认，请勿重复支付。正在等待订单状态同步。'
    } else {
      resultTitle.value = '支付处理中'
      resultDesc.value = '请前往「我的订单」查看支付状态'
    }
  } finally {
    loading.value = false
    polling = false
    if (resultType.value === 'pending' && !destroyed) {
      if (pollCount >= MAX_POLLS) {
        resultType.value = 'unconfirmed'
        resultTitle.value = paymentConfirmed.value ? '支付已确认，订单同步尚未完成' : '暂未确认支付结果'
        resultDesc.value = '请勿重复支付，请前往“我的订单”查看最新状态；若已扣款且状态长期未更新，请联系管理员。'
      } else {
        pollTimer = setTimeout(checkPayment, 3000)
      }
    }
  }
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  void checkPayment()
  // 如果是待支付状态，启动轮询（每 3 秒查询一次）
})

onBeforeUnmount(() => {
  destroyed = true
  stopPolling()
})
</script>

<style scoped>
.result-card {
  max-width: 540px;
  margin: 56px auto;
  padding: 56px 48px 48px;
  text-align: center;
  border-radius: var(--radius-xl);
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: pop .5s var(--ease) both;
}

@keyframes pop {
  from { opacity: 0; transform: scale(.96); }
  to { opacity: 1; transform: none; }
}

.result-icon {
  width: 88px; height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.result-icon.success { background: var(--success-light); color: #34c759; }
.result-icon.pending { background: var(--warning-light); color: #ff9f0a; }
.result-icon.fail { background: var(--danger-light); color: #ff3b30; }

.result-content h2 { font-size: 28px; font-weight: 700; letter-spacing: -.025em; margin-bottom: 10px; color: var(--text); }
.result-content p { font-size: 15px; color: var(--text-secondary); margin-bottom: 32px; line-height: 1.6; max-width: 400px; }

.result-actions { display: flex; gap: 12px; }

.spin { animation: spin 1s linear infinite; margin-bottom: 24px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .result-card { padding: 36px 22px; margin: 32px auto; }
  .result-actions { flex-direction: column; width: 100%; }
  .result-actions .btn { width: 100%; justify-content: center; }
}
</style>
