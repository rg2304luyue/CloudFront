<template>
  <div class="page-container">
    <h2 class="page-title">我的订单</h2>
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="orders.length === 0" description="还没有任何订单" show-action @action="$router.push('/product/list')" />
    <div v-else class="list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-head">
          <span class="order-no">{{ order.orderNo }}</span>
          <span class="order-status" :class="'s-'+order.status">{{ statusText(order.status) }}</span>
        </div>
        <div class="order-body" @click="$router.push(`/order/${order.id}`)">
          <div class="order-row"><span class="label">金额</span><strong class="amount">¥{{ order.totalAmount }}</strong></div>
          <div class="order-row" v-if="order.receiverAddress"><span class="label">收货地址</span><span>{{ order.receiverAddress }}</span></div>
          <div class="order-row"><span class="label">时间</span><span>{{ order.createTime }}</span></div>
        </div>
        <div class="order-foot" v-if="order.status === 0">
          <button class="cancel-btn" @click.stop="handleCancel(order.id)">取消订单</button>
        </div>
      </div>
    </div>
    <div v-if="total > size" class="pagination-wrap">
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

const router = useRouter(); const orders = ref([]); const loading = ref(true); const total = ref(0); const page = ref(1); const size = ref(10)
const statusMap = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 4: '已取消' }
function statusText(s) { return statusMap[s] || '未知' }

onMounted(() => fetchOrders())
async function fetchOrders() { loading.value = true; try { const r = await getOrderList({ page: page.value, size: size.value }); orders.value = r.data || []; total.value = r.total || 0 } finally { loading.value = false } }
function handleCancel(id) { ElMessageBox.confirm('确定取消该订单？', '提示', { type: 'warning' }).then(async () => { await cancelOrder(id); ElMessage.success('已取消'); fetchOrders() }).catch(() => {}) }
</script>

<style scoped>
.list { display: flex; flex-direction: column; gap: 12px; }
.order-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; transition: box-shadow .15s; }
.order-card:hover { box-shadow: var(--shadow); }
.order-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--border); }
.order-no { font-size: 12px; color: var(--text-muted); font-family: monospace; }
.order-status { font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 100px; }
.s-0 { background: #fff7e6; color: #d46b08; }
.s-1 { background: #f6ffed; color: #389e0d; }
.s-2 { background: #e6f7ff; color: #096dd9; }
.s-3 { background: #f5f5f5; color: #595959; }
.s-4 { background: #fff1f0; color: #cf1322; }
.order-body { cursor: pointer; }
.order-row { display: flex; gap: 8px; font-size: 13px; color: var(--text-secondary); line-height: 2; }
.label { color: var(--text-muted); min-width: 64px; }
.amount { color: var(--danger); font-size: 14px; }
.order-foot { text-align: right; padding-top: 12px; }
.cancel-btn { padding: 5px 16px; border: 1px solid var(--border); border-radius: 6px; background: #fff; color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all .15s; }
.cancel-btn:hover { border-color: var(--danger); color: var(--danger); }
.pagination-wrap { display: flex; justify-content: center; margin-top: 24px; }
</style>
