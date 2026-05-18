<template>
  <div class="page-container">
    <h2 class="page-title">个人中心</h2>
    <LoadingState v-if="loading" />
    <div v-else-if="userStore.userInfo" class="card">
      <div class="fields">
        <div class="field"><span class="label">用户名</span><span>{{ userStore.userInfo.username }}</span></div>
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
        <button v-else class="btn-ghost" @click="startEdit">编辑资料</button>
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

const userStore = useUserStore(); const loading = ref(false); const editing = ref(false)
const form = reactive({ nickname: '', phone: '', email: '' })

function startEdit() { form.nickname = userStore.userInfo.nickname || ''; form.phone = userStore.userInfo.phone || ''; form.email = userStore.userInfo.email || ''; editing.value = true }
async function save() { await updateUserInfo(form); await userStore.fetchUserInfo(); ElMessage.success('已更新'); editing.value = false }
</script>

<style scoped>
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; max-width: 520px; }
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
