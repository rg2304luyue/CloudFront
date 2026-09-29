<template>
  <div class="page-container">
    <PageHeader title="订单详情" :show-back="true" />

    <LoadingState v-if="loading" />
    <div v-else-if="order" class="detail-card card">
      <div class="detail-head">
        <div>
          <span class="head-label">订单状态</span>
          <span class="badge" :class="'status-' + order.status">
            {{ statusText(order.status) }}
          </span>
        </div>
        <span class="font-mono text-sm text-muted">{{ order.orderNo }}</span>
      </div>

      <div class="detail-grid">
        <div class="field">
          <span class="label">订单号</span>
          <span class="value font-mono">{{ order.orderNo }}</span>
        </div>
        <div class="field">
          <span class="label">下单时间</span>
          <span class="value">{{ order.createTime }}</span>
        </div>
        <div class="field">
          <span class="label">订单金额</span>
          <strong class="value amount">¥{{ formatAmount(order.totalAmount) }}</strong>
        </div>
        <div class="field">
          <span class="label">支付时间</span>
          <span class="value">{{ order.payTime || '—' }}</span>
        </div>
        <div class="field">
          <span class="label">收货人</span>
          <span class="value">{{ order.receiverName || '—' }}</span>
        </div>
        <div class="field">
          <span class="label">联系电话</span>
          <span class="value">{{ order.receiverPhone || '—' }}</span>
        </div>
        <div class="field full">
          <span class="label">收货地址</span>
          <span class="value">{{ order.receiverAddress || '—' }}</span>
        </div>
        <div class="field full" v-if="order.remark">
          <span class="label">备注</span>
          <span class="value">{{ order.remark }}</span>
        </div>
      </div>

      <div class="action-row" v-if="order.status === 0">
        <button class="btn btn-danger btn-lg" :disabled="isPaying(order.orderNo)" @click="handlePay(order.orderNo)">
          {{ isPaying(order.orderNo) ? '正在准备…' : '立即支付' }}
        </button>
      </div>

      <div class="action-row" v-if="order.status === 2">
        <button class="btn btn-primary btn-lg" @click="handleReceive(order.id)">确认收货</button>
      </div>
    </div>

    <EmptyState v-else-if="loadFailed" description="订单加载失败，请检查网络后重试" show-action @action="loadOrder" action-text="重新加载" />
    <EmptyState v-else description="订单不存在" @action="$router.back()" action-text="返回" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, receiveOrder } from '@/api/order'
import { ElMessageBox, ElMessage } from 'element-plus'
import { usePayment } from '@/composables/usePayment'
import { orderStatusText as statusText } from '@/constants/orderStatus'
import { formatAmount } from '@/utils/format'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const { handlePay, isPaying } = usePayment()
const order = ref(null)
const loading = ref(true)
const loadFailed = ref(false)

async function loadOrder() {
  loading.value = true
  loadFailed.value = false
  try {
    const r = await getOrderDetail(route.params.id)
    order.value = r.data
  } catch (e) {
    // 仅"订单不存在/非本人订单"（后端统一返回业务码 3001）与 HTTP 404 展示空态；
    // 其余（5xx、网络错误等）一律展示可重试的失败态，避免真实故障被"订单不存在"掩盖
    const notFound = e?.response?.status === 404 || e?.code === 3001
    if (!notFound) loadFailed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadOrder)

function handleReceive(id) {
  ElMessageBox.confirm('请确认已经收到商品', '确认收货', { type: 'info' })
    .then(async () => {
      await receiveOrder(id)
      ElMessage.success('已确认收货')
      const r = await getOrderDetail(route.params.id)
      order.value = r.data
    })
    .catch(() => {})
}
</script>

<style scoped>
.detail-card {
  padding: 36px 40px;
  border-radius: var(--radius-lg);
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-light);
}
.head-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.badge {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: var(--radius-full);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 48px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.field.full {
  grid-column: 1 / -1;
}
.label {
  font-size: 12px;
  color: var(--text-muted);
}
.value {
  font-size: 15px;
  color: var(--text);
  word-break: break-all;
}
.amount {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -.02em;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}
.action-row .btn-danger { background: var(--primary); }
.action-row .btn-danger:hover:not(:disabled) { background: var(--primary-hover); }

@media (max-width: 600px) {
  .detail-card { padding: 24px; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
