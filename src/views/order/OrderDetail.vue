<template>
  <div class="page-container">
    <LoadingState v-if="loading" />
    <div v-else-if="order" class="detail-card">
      <div class="detail-head">
        <h2>订单详情</h2>
        <span class="badge" :class="'s-'+order.status">{{ statusText(order.status) }}</span>
      </div>
      <div class="detail-grid">
        <div class="field"><span class="label">订单号</span><span class="mono">{{ order.orderNo }}</span></div>
        <div class="field"><span class="label">下单时间</span><span>{{ order.createTime }}</span></div>
        <div class="field"><span class="label">订单金额</span><strong class="amount">¥{{ order.totalAmount }}</strong></div>
        <div class="field"><span class="label">支付时间</span><span>{{ order.payTime || '-' }}</span></div>
        <div class="field"><span class="label">收货人</span><span>{{ order.receiverName || '-' }}</span></div>
        <div class="field"><span class="label">联系电话</span><span>{{ order.receiverPhone || '-' }}</span></div>
        <div class="field full"><span class="label">收货地址</span><span>{{ order.receiverAddress || '-' }}</span></div>
        <div class="field full" v-if="order.remark"><span class="label">备注</span><span>{{ order.remark }}</span></div>
      </div>
      <div class="back-row"><button class="back-btn" @click="$router.back()">返回</button></div>
    </div>
    <EmptyState v-else description="订单不存在" @action="$router.back()" action-text="返回" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail } from '@/api/order'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute(); const router = useRouter()
const order = ref(null); const loading = ref(true)
const statusMap = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 4: '已取消' }
function statusText(s) { return statusMap[s] || '未知' }

onMounted(async () => { try { const r = await getOrderDetail(route.params.id); order.value = r.data } finally { loading.value = false } })
</script>

<style scoped>
.detail-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; }
.detail-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
.detail-head h2 { font-size: 18px; font-weight: 600; }
.badge { font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 100px; }
.s-0 { background: #fff7e6; color: #d46b08; }
.s-1 { background: #f6ffed; color: #389e0d; }
.s-2 { background: #e6f7ff; color: #096dd9; }
.s-3 { background: #f5f5f5; color: #595959; }
.s-4 { background: #fff1f0; color: #cf1322; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field.full { grid-column: 1 / -1; }
.label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; }
.field span:not(.label) { font-size: 14px; }
.mono { font-family: monospace; font-size: 12px !important; color: var(--text-secondary); }
.amount { color: var(--danger); font-size: 18px; }
.back-row { margin-top: 28px; }
.back-btn { padding: 8px 20px; border: 1px solid var(--border); border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; transition: all .15s; }
.back-btn:hover { border-color: var(--primary); color: var(--primary); }
</style>
