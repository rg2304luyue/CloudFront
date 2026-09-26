<template>
  <div class="page-container">
    <PageHeader title="失败消息" subtitle="查看并重新发送达到最大重试次数的消息">
      <template #actions>
        <span class="message-count">共 {{ total }} 条</span>
        <el-button :loading="loading" :disabled="loading" @click="fetchMessages">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>
    </PageHeader>

    <div class="card table-card">
      <el-table :data="messages" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="id" label="消息ID" width="180" />
        <el-table-column prop="topic" label="Topic" min-width="190" show-overflow-tooltip />
        <el-table-column prop="messageKey" label="消息键" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default>
            <el-tag type="danger" size="small">发送失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="重试次数" width="110" align="center">
          <template #default="{ row }">
            <span class="retry-count">{{ row.retryCount }} / {{ row.maxRetries }}</span>
          </template>
        </el-table-column>
        <el-table-column label="失败时间" width="170">
          <template #default="{ row }">{{ formatTime(row.updateTime || row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="warning"
              plain
              :loading="retryingIds.has(row.id)"
              :disabled="retryingIds.has(row.id)"
              @click="handleRetry(row)"
            >
              重新发送
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState description="暂无发送失败的消息" icon="CircleCheck" />
        </template>
      </el-table>
    </div>

    <p v-if="total > messages.length" class="list-hint">
      当前显示最早的 {{ messages.length }} 条失败消息，处理后刷新可继续查看。
    </p>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFailedOutboxMessages, retryFailedOutboxMessage } from '@/api/order'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'

const messages = ref([])
const total = ref(0)
const loading = ref(false)
const retryingIds = reactive(new Set())
let fetchSequence = 0

function formatTime(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : '—'
}

async function fetchMessages() {
  const sequence = ++fetchSequence
  loading.value = true
  try {
    const res = await getFailedOutboxMessages(50)
    if (sequence === fetchSequence) {
      messages.value = res.data || []
      total.value = res.total || 0
    }
  } finally {
    if (sequence === fetchSequence) loading.value = false
  }
}

async function handleRetry(message) {
  if (retryingIds.has(message.id)) return
  retryingIds.add(message.id)
  try {
    await ElMessageBox.confirm(
      `确定重新发送消息 ${message.id} 吗？`,
      '确认重发',
      {
        confirmButtonText: '重新发送',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await retryFailedOutboxMessage(message.id)
    messages.value = messages.value.filter(item => item.id !== message.id)
    total.value = Math.max(0, total.value - 1)
    ElMessage.success('消息已重新加入发送队列')
    await fetchMessages()
  } catch {
    // 取消确认或请求失败时，由确认框/请求拦截器负责提示。
  } finally {
    retryingIds.delete(message.id)
  }
}

onMounted(fetchMessages)
</script>

<style scoped>
.message-count { font-size: 13px; color: var(--text-muted); }
.retry-count { color: var(--danger); font-weight: 600; }
.list-hint { margin-top: 12px; color: var(--text-muted); font-size: 12px; text-align: right; }

@media (max-width: 768px) {
  .message-count { display: none; }
}
</style>
