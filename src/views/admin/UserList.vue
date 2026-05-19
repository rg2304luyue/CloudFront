<template>
  <div class="page-container">
    <h2 class="page-title">卖家申请</h2>
    <el-table v-if="applications.length > 0" :data="applications" style="width:100%;max-width:900px;margin-bottom:32px" border stripe>
      <el-table-column prop="id" label="申请ID" width="160" />
      <el-table-column prop="userId" label="用户ID" width="160" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default><el-tag type="warning" size="small">待审批</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{row}">
          <el-button size="small" type="success" @click="handleApprove(row, true)">通过</el-button>
          <el-button size="small" type="danger" @click="handleApprove(row, false)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
    <p v-else style="color:var(--text-muted);margin-bottom:32px">暂无待审批的卖家申请</p>

    <h2 class="page-title">用户管理</h2>

    <el-table :data="users" style="width:100%;max-width:900px" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="160" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column label="角色" width="80">
        <template #default="{row}">
          <el-tag :type="row.role === 'ADMIN' ? 'danger' : row.role === 'SELLER' ? 'primary' : 'info'" size="small">
            {{ roleMap[row.role] || '买家' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机" width="130" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{row}">
          <el-button size="small" type="warning" @click="showResetDialog(row)">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="resetVisible" title="重置密码" width="360px">
      <p style="margin-bottom:12px">为用户 <b>{{ resetTarget?.username }}</b> 设置新密码：</p>
      <el-input v-model="newPassword" type="password" placeholder="新密码（至少6位）" />
      <template #footer>
        <el-button @click="resetVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReset" :loading="resetting">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserList, resetPassword, getApplications, processApplication } from '@/api/user'
import { ElMessage } from 'element-plus'

const users = ref([]); const loading = ref(true)
const resetVisible = ref(false); const resetting = ref(false)
const resetTarget = ref(null); const newPassword = ref('')
const applications = ref([])
const roleMap = { BUYER: '买家', SELLER: '卖家', ADMIN: '管理员' }

onMounted(async () => {
  loading.value = true
  try {
    const [userRes, appRes] = await Promise.all([getUserList(), getApplications()])
    users.value = userRes.data || []
    applications.value = appRes.data || []
  }
  finally { loading.value = false }
})

async function handleApprove(app, approved) {
  try {
    await processApplication(app.id, approved)
    ElMessage.success(approved ? '已通过' : '已拒绝')
    applications.value = applications.value.filter(a => a.id !== app.id)
    if (approved) {
      const res = await getUserList()
      users.value = res.data || []
    }
  } catch {}
}

function showResetDialog(user) {
  resetTarget.value = user
  newPassword.value = ''
  resetVisible.value = true
}

async function handleReset() {
  if (!newPassword.value || newPassword.value.length < 6) {
    ElMessage.warning('密码至少6位'); return
  }
  resetting.value = true
  try {
    await resetPassword(resetTarget.value.id, newPassword.value)
    ElMessage.success('密码已重置')
    resetVisible.value = false
  } catch {} finally { resetting.value = false }
}
</script>
