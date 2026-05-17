<template>
  <div class="page-container">
    <h3 class="page-title">我的订单</h3>
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="orders.length === 0" description="还没有订单" show-action action-text="去逛逛" @action="$router.push('/product/list')" />
    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">订单号: {{ order.orderNo }}</span>
          <el-tag :type="statusType(order.status)" size="small">{{ statusText(order.status) }}</el-tag>
        </div>
        <div class="order-body" @click="$router.push(`/order/${order.id}`)">
          <p>金额: <strong>¥{{ order.totalAmount }}</strong></p>
          <p v-if="order.receiverAddress">收货地址: {{ order.receiverAddress }}</p>
          <p>时间: {{ order.createTime }}</p>
        </div>
        <div class="order-actions" v-if="order.status === 0">
          <el-button size="small" @click="handleCancel(order.id)">取消订单</el-button>
        </div>
      </div>
    </div>
    <div v-if="total > 0" class="pagination-wrap">
      <el-pagination v-model:current-page="page" :page-size="size" :total="total" layout="prev, pager, next" @current-change="fetchOrders" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList, cancelOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const orders = ref([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const size = ref(10)

const statusMap = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 4: '已取消' }
const typeMap = { 0: 'warning', 1: 'success', 2: 'primary', 3: 'info', 4: 'info' }

function statusText(s) { return statusMap[s] || '未知' }
function statusType(s) { return typeMap[s] || 'info' }

onMounted(() => fetchOrders())

async function fetchOrders() {
  loading.value = true
  try {
    const res = await getOrderList({ page: page.value, size: size.value })
    orders.value = res.data || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleCancel(id) {
  ElMessageBox.confirm('确定取消该订单？', '提示', { type: 'warning' }).then(async () => {
    await cancelOrder(id)
    ElMessage.success('订单已取消')
    fetchOrders()
  }).catch(() => {})
}
</script>

<style scoped>
.page-title { font-size: 22px; font-weight: 600; margin-bottom: 20px; }
.order-list { display: flex; flex-direction: column; gap: 16px; }
.order-card { background: #fff; border-radius: 8px; padding: 20px; transition: box-shadow .2s; }
.order-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.06); }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ebeef5; }
.order-no { font-size: 13px; color: #909399; }
.order-body { cursor: pointer; font-size: 14px; color: #606266; line-height: 1.8; }
.order-actions { text-align: right; margin-top: 12px; }
.pagination-wrap { display: flex; justify-content: center; margin-top: 24px; }
</style>
