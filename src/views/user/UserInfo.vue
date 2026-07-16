<template>
  <div class="page-container">
    <PageHeader title="个人中心" subtitle="管理你的个人资料和头像" />

    <LoadingState v-if="loading" />
    <div v-else-if="userStore.userInfo" class="profile">
      <!-- Avatar Section -->
      <div class="profile-avatar">
        <div class="avatar-wrapper" @click="!uploading && fileInput.click()" title="点击更换头像">
          <el-image v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" fit="cover" class="avatar-img">
            <template #error>
              <el-icon :size="40" color="#d1d5db"><UserFilled /></el-icon>
            </template>
          </el-image>
          <el-icon v-else :size="40" color="#d1d5db"><UserFilled /></el-icon>
          <div class="avatar-overlay">
            <el-icon :size="20"><CameraFilled /></el-icon>
            <span>更换头像</span>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" class="file-input" />

        <h3 class="profile-name">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</h3>
        <span class="profile-role">
          <el-tag :type="roleTagType" size="small">{{ userStore.roleLabel }}</el-tag>
        </span>
      </div>

      <!-- Info Fields -->
      <div class="profile-fields card">
        <div class="field">
          <span class="field-label">用户名</span>
          <span class="field-value">{{ userStore.userInfo.username }}</span>
        </div>
        <div class="field">
          <span class="field-label">昵称</span>
          <input v-if="editing" v-model="form.nickname" class="field-input" placeholder="输入昵称" />
          <span v-else class="field-value">{{ userStore.userInfo.nickname || '—' }}</span>
        </div>
        <div class="field">
          <span class="field-label">手机号</span>
          <input v-if="editing" v-model="form.phone" class="field-input" placeholder="输入手机号" />
          <span v-else class="field-value">{{ userStore.userInfo.phone || '—' }}</span>
        </div>
        <div class="field">
          <span class="field-label">邮箱</span>
          <input v-if="editing" v-model="form.email" class="field-input" placeholder="输入邮箱" />
          <span v-else class="field-value">{{ userStore.userInfo.email || '—' }}</span>
        </div>

        <div class="field-actions">
          <template v-if="editing">
            <button class="btn btn-primary" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
            <button class="btn btn-ghost" @click="editing = false">取消</button>
          </template>
          <template v-else>
            <button class="btn btn-ghost" @click="startEdit">编辑资料</button>
            <button v-if="userStore.role === 'BUYER'" class="btn btn-primary" @click="handleApply" :disabled="applied">
              {{ applied ? '已申请' : '申请成为卖家' }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <AvatarCropper v-if="cropFile" :file="cropFile" @close="cropFile = null" @cropped="handleCropped" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateUserInfo, applySeller, uploadAvatar } from '@/api/user'
import { ElMessage } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'
import PageHeader from '@/components/PageHeader.vue'
import AvatarCropper from '@/components/AvatarCropper.vue'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const editing = ref(false)
const applied = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const cropFile = ref(null)

onMounted(async () => {
  if (!userStore.userInfo && userStore.isLogin) {
    loading.value = true
    try { await userStore.fetchUserInfo() } finally { loading.value = false }
  }
})

const form = reactive({ nickname: '', phone: '', email: '' })

const roleTagType = computed(() => {
  if (userStore.isAdmin) return 'danger'
  if (userStore.isSeller) return 'primary'
  return 'info'
})

function startEdit() {
  form.nickname = userStore.userInfo.nickname || ''
  form.phone = userStore.userInfo.phone || ''
  form.email = userStore.userInfo.email || ''
  editing.value = true
}

async function save() {
  saving.value = true
  try {
    await updateUserInfo(form)
    await userStore.fetchUserInfo()
    ElMessage.success('已更新')
    editing.value = false
  } catch { ElMessage.error('保存失败') } finally {
    saving.value = false
  }
}

async function handleApply() {
  try {
    await applySeller()
    ElMessage.success('申请已提交！')
    applied.value = true
  } catch {
    // 错误已由 request.js 响应拦截器处理（显示错误消息）
  }
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  cropFile.value = file
  fileInput.value.value = ''
}

async function handleCropped(blob) {
  cropFile.value = null
  uploading.value = true
  try {
    const res = await uploadAvatar(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
    if (res.data) {
      await updateUserInfo({ avatar: res.data })
      await userStore.fetchUserInfo()
      ElMessage.success('头像已更新')
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.profile {
  max-width: 560px;
  margin: 0 auto;
}

/* Avatar */
.profile-avatar {
  text-align: center;
  margin-bottom: 28px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid var(--primary-light);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f5f6fa;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.avatar-wrapper:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 6px rgba(79,110,245,.1);
}
.avatar-wrapper:hover .avatar-overlay { opacity: 1; }

.avatar-img { width: 100%; height: 100%; }
.avatar-img :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  color: #fff;
  font-size: 11px;
}

.file-input { display: none; }

.profile-name {
  font-size: 18px;
  font-weight: 600;
  margin-top: 14px;
}
.profile-role {
  display: inline-block;
  margin-top: 6px;
}

/* Fields */
.profile-fields {
  padding: 28px;
}

.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light);
}
.field:last-of-type {
  border-bottom: none;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 80px;
}
.field-value {
  font-size: 14px;
  color: var(--text);
  text-align: right;
  flex: 1;
}
.field-input {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  text-align: right;
  width: 200px;
  transition: border-color var(--transition-fast);
}
.field-input:focus {
  border-color: var(--primary);
}

.field-actions {
  display: flex;
  gap: 8px;
  padding-top: 20px;
  justify-content: flex-end;
}
</style>
