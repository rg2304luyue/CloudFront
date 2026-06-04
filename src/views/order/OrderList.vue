<template>
  <div class="page-container">
    <PageHeader title="我的订单" subtitle="查看和管理你的所有订单" />

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="orders.length === 0" description="还没有任何订单，快去选购吧" show-action @action="$router.push('/product/list')" action-text="去逛逛" />

    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card card">
        <div class="order-head">
          <div class="order-head-left">
            <span class="order-no font-mono">{{ order.orderNo }}</span>
            <span class="order-time">{{ order.createTime }}</span>
          </div>
          <span class="badge" :class="'status-' + order.status">
            {{ statusText(order.status) }}
          </span>
        </div>

        <div class="order-body" @click="$router.push(`/order/${order.id}`)">
          <div class="order-info-grid">
            <div class="info-item">
              <span class="info-label">订单金额</span>
              <strong class="info-value amount">¥{{ order.totalAmount }}</strong>
            </div>
            <div class="info-item" v-if="order.receiverAddress">
              <span class="info-label">收货地址</span>
              <span class="info-value truncate">{{ order.receiverAddress }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">下单时间</span>
              <span class="info-value">{{ order.createTime }}</span>
            </div>
          </div>
        </div>

        <div class="order-foot">
          <button v-if="order.status === 0" class="btn btn-danger" @click.stop="handlePay(order.orderNo)">立即支付</button>
          <button v-if="order.status === 0" class="btn btn-ghost" @click.stop="handleCancel(order.id)">取消订单</button>
          <button v-if="order.status === 2" class="btn btn-primary" @click.stop="handleReceive(order.id)">确认收货</button>
        </div>
      </div>
    </div>

    <div v-if="total > size" class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        :page-size="size"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchOrders"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList, cancelOrder, receiveOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePayment } from '@/composables/usePayment'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'

import { orderStatusText as statusText } from '@/constants/orderStatus'

const router = useRouter()
const { handlePay } = usePayment()
const orders = ref([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const size = ref(10)

onMounted(() => fetchOrders())

async function fetchOrders() {
  loading.value = true
  try {
    const r = await getOrderList({ page: page.value, size: size.value })
    orders.value = r.data || []
    total.value = r.total || 0
  } finally {
    loading.value = false
  }
}

function handleCancel(id) {
  ElMessageBox.confirm('确定取消该订单？', '提示', { type: 'warning' })
    .then(async () => {
      await cancelOrder(id)
      ElMessage.success('已取消')
      fetchOrders()
    })
    .catch(() => {})
}

function handleReceive(id) {
  ElMessageBox.confirm('请确认已经收到商品', '确认收货', { type: 'info' })
    .then(async () => {
      await receiveOrder(id)
      ElMessage.success('已确认收货')
      fetchOrders()
    })
    .catch(() => {})
}
</script>

<style scoped>
.order-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-card {
  padding: 20px 24px;
  cursor: default;
}

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border-light);
}
.order-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.order-no {
  font-size: 12px;
  color: var(--text-muted);
}
.order-time {
  font-size: 12px;
  color: var(--text-muted);
}

/* Status badges */
.badge {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.order-body {
  cursor: pointer;
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.info-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .4px;
}
.info-value {
  font-size: 13px;
  color: var(--text-secondary);
}
.amount {
  color: var(--danger);
  font-size: 16px;
  font-weight: 700;
}

.order-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--border-light);
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

@media (max-width: 600px) {
  .order-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
