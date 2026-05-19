<template>
  <div class="page-container">
    <h2 class="page-title">个人中心</h2>
    <LoadingState v-if="loading" />
    <div v-else-if="userStore.userInfo" class="card">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrap" @click="!uploading && fileInput.click()" title="点击更换头像">
          <el-image v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" fit="cover" class="avatar-img">
            <template #error><el-icon :size="40" color="#d1d5db"><UserFilled /></el-icon></template>
          </el-image>
          <el-icon v-else :size="40" color="#d1d5db"><UserFilled /></el-icon>
          <div class="avatar-overlay">
            <el-icon :size="20" color="#fff"><CameraFilled /></el-icon>
            <span>更换头像</span>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" class="file-input" />
      </div>

      <div class="fields">
        <div class="field"><span class="label">用户名</span><span>{{ userStore.userInfo.username }}</span></div>
        <div class="field"><span class="label">角色</span><el-tag :type="roleTagType" size="small">{{ userStore.roleLabel }}</el-tag></div>
        <div class="field">
          <span class="label">昵称</span>
          <input v-if="editing" v-model="form.nickname" class="field-input" />
          <span v-else>{{ userStore.userInfo.nickname || '-' }}</span>
        </div>
        <div class="field">
          <span class="label">手机号</span>
          <input v-if="editing" v-model="form.phone" class="field-input" />
          <span v-else>{{ userStore.userInfo.phone || '-' }}</span>
        </div>
        <div class="field">
          <span class="label">邮箱</span>
          <input v-if="editing" v-model="form.email" class="field-input" />
          <span v-else>{{ userStore.userInfo.email || '-' }}</span>
        </div>
      </div>
      <div class="actions">
        <template v-if="editing">
          <button class="btn-primary" @click="save">保存</button>
          <button class="btn-ghost" @click="editing=false">取消</button>
        </template>
        <template v-else>
          <button class="btn-ghost" @click="startEdit">编辑资料</button>
          <button v-if="userStore.role === 'BUYER'" class="btn-primary" @click="handleApply" :disabled="applied">申请成为卖家</button>
        </template>
      </div>
    </div>

    <AvatarCropper v-if="cropFile" :file="cropFile" @close="cropFile = null" @cropped="handleCropped" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateUserInfo, applySeller, uploadAvatar } from '@/api/user'
import { ElMessage } from 'element-plus'
import { CameraFilled, UserFilled } from '@element-plus/icons-vue'
import LoadingState from '@/components/LoadingState.vue'
import AvatarCropper from '@/components/AvatarCropper.vue'

const userStore = useUserStore(); const loading = ref(false); const editing = ref(false); const applied = ref(false)
const uploading = ref(false); const fileInput = ref(null); const cropFile = ref(null)
const form = reactive({ nickname: '', phone: '', email: '' })

const roleTagType = computed(() => {
  if (userStore.isAdmin) return 'danger'
  if (userStore.isSeller) return 'primary'
  return 'info'
})

function startEdit() { form.nickname = userStore.userInfo.nickname || ''; form.phone = userStore.userInfo.phone || ''; form.email = userStore.userInfo.email || ''; editing.value = true }
async function save() { await updateUserInfo(form); await userStore.fetchUserInfo(); ElMessage.success('已更新'); editing.value = false }

async function handleApply() {
  try {
    await applySeller()
    ElMessage.success('申请已提交！')
    applied.value = true
  } catch {}
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
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; max-width: 520px; }
.avatar-section { display: flex; justify-content: center; margin-bottom: 28px; }
.avatar-wrap {
  position: relative; width: 96px; height: 96px; border-radius: 50%;
  overflow: hidden; cursor: pointer; border: 3px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  background: #f3f4f6; transition: border-color .15s;
}
.avatar-wrap:hover { border-color: var(--primary); }
.avatar-wrap:hover .avatar-overlay { opacity: 1; }
.avatar-img { width: 100%; height: 100%; }
.avatar-img :deep(img) { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.avatar-overlay {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(0,0,0,.45); display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  opacity: 0; transition: opacity .2s; color: #fff; font-size: 11px;
}
.file-input { display: none; }

.fields { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; }
.field span:not(.label) { font-size: 14px; }
.field-input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; outline: none; transition: border-color .15s; }
.field-input:focus { border-color: var(--primary); }
.actions { display: flex; gap: 8px; }
.btn-primary { padding: 8px 20px; border: none; border-radius: 6px; background: var(--primary); color: #fff; font-size: 13px; cursor: pointer; transition: background .15s; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-ghost { padding: 8px 20px; border: 1px solid var(--border); border-radius: 6px; background: #fff; color: var(--text); font-size: 13px; cursor: pointer; transition: all .15s; }
.btn-ghost:hover { border-color: var(--primary); color: var(--primary); }
</style>
