<template>
  <div class="auth-root">
    <div class="auth-panel">
      <div class="auth-left">
        <div class="brand">
          <div class="brand-icon"><el-icon :size="28"><ShoppingBag /></el-icon></div>
          <h1>CloudMall</h1>
          <p>加入我们，开启购物之旅</p>
        </div>
      </div>
      <div class="auth-right">
        <h2>注册</h2>
        <p class="sub">创建一个新账号</p>
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent="handleRegister">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input v-model="form.nickname" placeholder="昵称（选填）" :prefix-icon="EditPen" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" native-type="submit" class="submit-btn">
              {{ loading ? '注册中...' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>
        <p class="switch">已有账号？<router-link to="/login">立即登录 →</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, EditPen } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter(); const userStore = useUserStore()
const formRef = ref(null); const loading = ref(false)
const form = reactive({ username: '', password: '', confirmPassword: '', nickname: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }, { validator: (_r, v, cb) => v !== form.password ? cb(new Error('密码不一致')) : cb(), trigger: 'blur' }]
}
async function handleRegister() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return; loading.value = true
  try { await userStore.register(form.username, form.password, form.nickname || form.username); ElMessage.success('注册成功，请登录'); router.push('/login') } catch {} finally { loading.value = false }
}
</script>

<style scoped>
.auth-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 20px; }
.auth-panel { display: flex; width: 800px; min-height: 520px; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md); background: var(--bg-card); }
.auth-left { width: 340px; background: linear-gradient(150deg, #4f6ef5 0%, #3b5de7 40%, #2d1b69 100%); display: flex; align-items: center; justify-content: center; color: #fff; padding: 40px; }
.brand { text-align: center; }
.brand-icon { width: 56px; height: 56px; border-radius: 14px; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.brand h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
.brand p { font-size: 13px; opacity: .7; }
.auth-right { flex: 1; padding: 48px 44px; display: flex; flex-direction: column; justify-content: center; }
.auth-right h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.sub { font-size: 13px; color: var(--text-muted); margin-bottom: 28px; }
.submit-btn { width: 100%; height: 44px; border-radius: 8px; font-size: 15px; }
.switch { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 8px; }
.switch a { color: var(--primary); font-weight: 500; }
</style>
