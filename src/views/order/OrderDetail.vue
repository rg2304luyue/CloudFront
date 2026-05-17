<template>
  <div class="page-container">
    <LoadingState v-if="loading" />
    <div v-else-if="order" class="order-detail">
      <div class="detail-header">
        <h3>订单详情</h3>
        <el-tag :type="statusType(order.status)" size="large">{{ statusText(order.status) }}</el-tag>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ statusText(order.status) }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ order.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ order.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ order.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ order.receiverName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ order.receiverPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ order.receiverAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ order.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div class="detail-actions" v-if="order.status === 0">
        <el-button @click="$router.back()">返回</el-button>
      </div>
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

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(true)

const statusMap = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 4: '已取消' }
const typeMap = { 0: 'warning', 1: 'success', 2: 'primary', 3: 'info', 4: 'info' }

function statusText(s) { return statusMap[s] || '未知' }
function statusType(s) { return typeMap[s] || 'info' }

onMounted(async () => {
  try {
    const res = await getOrderDetail(route.params.id)
    order.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-detail { background: #fff; border-radius: 8px; padding: 30px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.detail-header h3 { font-size: 20px; font-weight: 600; }
.detail-actions { margin-top: 24px; text-align: right; }
</style>
