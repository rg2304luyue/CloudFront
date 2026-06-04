<template>
  <div class="page-container">
    <PageHeader title="订单管理" subtitle="管理包含您商品的订单" />

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="orders.length === 0" description="暂无订单" />

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

        <div class="order-items">
          <div v-for="item in order.orderItems" :key="item.id" class="order-item-row">
            <el-image v-if="item.productImage" :src="item.productImage" fit="cover"
              style="width:48px;height:48px;border-radius:6px;" />
            <div class="item-info">
              <span class="item-name">{{ item.productName }}</span>
              <span class="item-meta">¥{{ item.price }} x {{ item.quantity }}</span>
            </div>
            <span class="item-total">¥{{ item.totalAmount }}</span>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-footer-info">
            <span>收货人：{{ order.receiverName || '—' }}</span>
            <span>{{ order.receiverPhone || '—' }}</span>
          </div>
          <div class="order-footer-actions">
            <span class="total-amount">合计：<strong>¥{{ order.totalAmount }}</strong></span>
            <button v-if="order.status === 1" class="btn btn-primary" @click="handleShip(order.id)">
              发货
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > size" class="pagination-wrap">
      <el-pagination v-model:current-page="page" :page-size="size" :total="total"
        layout="prev, pager, next" @current-change="fetchOrders" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSellerOrders, shipOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderStatusText as statusText } from '@/constants/orderStatus'
import { usePolling } from '@/composables/usePolling'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'

const orders = ref([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const size = ref(10)

async function fetchOrders(silent = false) {
  if (!silent) loading.value = true
  try {
    const r = await getSellerOrders({ page: page.value, size: size.value })
    orders.value = r.data || []
    total.value = r.total || 0
  } catch (e) {
    if (!silent) throw e
  } finally {
    if (!silent) loading.value = false
  }
}

function handleShip(id) {
  ElMessageBox.confirm('确定发货该订单？', '确认发货', { type: 'warning' })
    .then(async () => {
      await shipOrder(id)
      ElMessage.success('发货成功')
      fetchOrders()
    })
    .catch(() => {})
}

onMounted(() => fetchOrders())

// 30 秒轮询 + visibility 自动暂停/恢复
usePolling(() => fetchOrders(true))
</script>

<style scoped>
.order-list { display: flex; flex-direction: column; gap: 14px; }
.order-card { padding: 20px 24px; }
.order-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--border-light); }
.order-head-left { display: flex; align-items: center; gap: 12px; }
.order-no { font-size: 12px; color: var(--text-muted); }
.order-time { font-size: 12px; color: var(--text-muted); }
.badge { font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: var(--radius-full); }
.order-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.order-item-row { display: flex; align-items: center; gap: 12px; }
.item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.item-name { font-size: 14px; color: var(--text); }
.item-meta { font-size: 12px; color: var(--text-muted); }
.item-total { font-size: 14px; font-weight: 600; color: var(--danger); }
.order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-light); }
.order-footer-info { font-size: 13px; color: var(--text-secondary); display: flex; gap: 12px; }
.order-footer-actions { display: flex; align-items: center; gap: 16px; }
.total-amount { font-size: 13px; color: var(--text-secondary); }
.total-amount strong { color: var(--danger); font-size: 16px; }
.pagination-wrap { display: flex; justify-content: center; margin-top: 28px; }
</style>