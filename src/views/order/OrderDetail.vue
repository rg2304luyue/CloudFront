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
          <strong class="value amount">¥{{ order.totalAmount }}</strong>
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
        <button class="btn btn-danger btn-lg" @click="handlePay(order.orderNo)">立即支付</button>
      </div>

      <div class="action-row" v-if="order.status === 2">
        <button class="btn btn-primary btn-lg" @click="handleReceive(order.id)">确认收货</button>
      </div>
    </div>

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
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const { handlePay } = usePayment()
const order = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const r = await getOrderDetail(route.params.id)
    order.value = r.data
  } finally {
    loading.value = false
  }
})

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
  padding: 32px;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}
.head-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 8px;
}

.badge {
  font-size: 13px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: var(--radius-full);
}
.status-0 { background: #fff7ed; color: #ea580c; }
.status-1 { background: #f0fdf6; color: #16a34a; }
.status-2 { background: #eff6ff; color: #2563eb; }
.status-3 { background: #f5f5f5; color: #737373; }
.status-4 { background: #fef2f2; color: #dc2626; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 36px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field.full {
  grid-column: 1 / -1;
}
.label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
}
.value {
  font-size: 14px;
  color: var(--text-secondary);
}
.amount {
  color: var(--danger);
  font-size: 20px;
  font-weight: 700;
}

.action-row {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}
</style>
