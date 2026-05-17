<template>
  <div class="page-container">
    <h3 class="page-title">个人中心</h3>
    <LoadingState v-if="loading" />
    <div v-else-if="userStore.userInfo" class="user-card">
      <el-descriptions :column="1" border size="large">
        <el-descriptions-item label="用户名">{{ userStore.userInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">
          <template v-if="editing">
            <el-input v-model="form.nickname" size="small" />
          </template>
          <template v-else>{{ userStore.userInfo.nickname || '-' }}</template>
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          <template v-if="editing">
            <el-input v-model="form.phone" size="small" />
          </template>
          <template v-else>{{ userStore.userInfo.phone || '-' }}</template>
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          <template v-if="editing">
            <el-input v-model="form.email" size="small" />
          </template>
          <template v-else>{{ userStore.userInfo.email || '-' }}</template>
        </el-descriptions-item>
      </el-descriptions>
      <div class="actions">
        <template v-if="editing">
          <el-button type="primary" @click="save">保存</el-button>
          <el-button @click="editing = false">取消</el-button>
        </template>
        <el-button v-else type="primary" @click="startEdit">编辑</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateUserInfo } from '@/api/user'
import { ElMessage } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'

const userStore = useUserStore()
const loading = ref(false)
const editing = ref(false)

const form = reactive({ nickname: '', phone: '', email: '' })

function startEdit() {
  form.nickname = userStore.userInfo.nickname || ''
  form.phone = userStore.userInfo.phone || ''
  form.email = userStore.userInfo.email || ''
  editing.value = true
}

async function save() {
  await updateUserInfo(form)
  await userStore.fetchUserInfo()
  ElMessage.success('更新成功')
  editing.value = false
}
</script>

<style scoped>
.page-title { font-size: 22px; font-weight: 600; margin-bottom: 20px; }
.user-card { background: #fff; border-radius: 8px; padding: 30px; max-width: 600px; }
.actions { margin-top: 20px; }
</style>
