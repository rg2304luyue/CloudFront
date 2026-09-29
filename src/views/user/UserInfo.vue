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
              <el-icon :size="40" color="#ffffff"><UserFilled /></el-icon>
            </template>
          </el-image>
          <el-icon v-else :size="40" color="#ffffff"><UserFilled /></el-icon>
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
    ElMessage.success('申请已提交！审批通过后需重新登录才能使用卖家功能')
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
  max-width: 600px;
  margin: 0 auto;
}

/* Avatar */
.profile-avatar {
  text-align: center;
  margin-bottom: 32px;
}

.avatar-wrapper {
  position: relative;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #c7c7cc, #a1a1a6);
  box-shadow: 0 0 0 4px #fff, var(--shadow);
  transition: box-shadow var(--transition), transform var(--transition);
}
.avatar-wrapper:hover {
  box-shadow: 0 0 0 4px #fff, 0 0 0 6px rgba(0,113,227,.35), var(--shadow-md);
  transform: scale(1.02);
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
  background: rgba(0,0,0,.42);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
}

.file-input { display: none; }

.profile-name {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -.02em;
  margin-top: 18px;
}
.profile-role {
  display: inline-block;
  margin-top: 8px;
}

/* Fields: grouped list, iOS Settings style */
.profile-fields {
  padding: 8px 28px 24px;
  border-radius: var(--radius-lg);
}

.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);
}

.field-label {
  font-size: 15px;
  color: var(--text);
  flex-shrink: 0;
  width: 80px;
}
.field-value {
  font-size: 15px;
  color: var(--text-secondary);
  text-align: right;
  flex: 1;
}
.field-input {
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--bg);
  font-size: 15px;
  color: var(--text);
  outline: none;
  text-align: right;
  width: 240px;
  transition: box-shadow var(--transition-fast), background var(--transition-fast);
}
.field-input:focus {
  background: #fff;
  box-shadow: 0 0 0 1px var(--primary) inset, var(--primary-ring);
}

.field-actions {
  display: flex;
  gap: 10px;
  padding-top: 24px;
  justify-content: flex-end;
}

@media (max-width: 480px) {
  .profile-fields { padding: 4px 18px 20px; }
  .field-input { width: 100%; max-width: 200px; }
}
</style>
