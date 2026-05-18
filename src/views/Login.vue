<template>
  <div class="auth-root">
    <div class="auth-panel">
      <div class="auth-left">
        <div class="brand">
          <div class="brand-icon"><el-icon :size="28"><ShoppingBag /></el-icon></div>
          <h1>CloudMall</h1>
          <p>微服务架构电商平台</p>
        </div>
      </div>
      <div class="auth-right">
        <h2>登录</h2>
        <p class="sub">欢迎回来，请登录你的账号</p>
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" native-type="submit" class="submit-btn">
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        <p class="switch">还没有账号？<router-link to="/register">立即注册 →</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'

const router = useRouter(); const route = useRoute()
const userStore = useUserStore(); const cartStore = useCartStore()
const formRef = ref(null); const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    await userStore.fetchUserInfo()
    await cartStore.fetchCart()
    ElMessage.success('登录成功')
    router.push(route.query.redirect || '/home')
  } catch {} finally { loading.value = false }
}
</script>

<style scoped>
.auth-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 20px; }
.auth-panel { display: flex; width: 800px; min-height: 480px; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md); background: var(--bg-card); }
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
