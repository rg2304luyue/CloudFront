<template>
  <div class="auth-root">
    <div class="auth-panel">
      <!-- Brand Side -->
      <div class="auth-left">
        <div class="brand">
          <div class="brand-icon"><el-icon :size="30"><ShoppingBag /></el-icon></div>
          <h1>CloudMall</h1>
          <p>微服务架构 · 全栈电商平台</p>
        </div>
        <div class="brand-features">
          <div class="feature"><el-icon :size="16"><Checked /></el-icon> 品质商品</div>
          <div class="feature"><el-icon :size="16"><Checked /></el-icon> 安全支付</div>
          <div class="feature"><el-icon :size="16"><Checked /></el-icon> 极速配送</div>
        </div>
      </div>

      <!-- Form Side -->
      <div class="auth-right">
        <div class="auth-header">
          <h2>欢迎回来</h2>
          <p>登录你的 CloudMall 账号</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" native-type="submit" class="submit-btn">
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <p class="switch-text">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const formRef = ref(null)
const loading = ref(false)
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
    const target = route.query.redirect || '/home'
    router.push(target)
  } catch {
    // 错误已由 request.js 响应拦截器处理（显示错误消息）
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f6fa 0%, #eff2ff 50%, #f5f6fa 100%);
  padding: 24px;
}

.auth-panel {
  display: flex;
  width: 840px;
  min-height: 500px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(0,0,0,.03);
  background: var(--bg-card);
}

/* Left Brand */
.auth-left {
  width: 360px;
  background: linear-gradient(155deg, #4f6ef5 0%, #3b54d4 50%, #1a1a2e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 48px 36px;
  gap: 40px;
}

.brand { text-align: center; }
.brand-icon {
  width: 60px; height: 60px;
  border-radius: 16px;
  background: rgba(255,255,255,.15);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  border: 1px solid rgba(255,255,255,.1);
}
.brand h1 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -.5px;
  margin-bottom: 6px;
}
.brand p {
  font-size: 13px;
  opacity: .65;
  line-height: 1.5;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 200px;
}
.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  opacity: .75;
}

/* Right Form */
.auth-right {
  flex: 1;
  padding: 52px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-header {
  margin-bottom: 30px;
}
.auth-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.3px;
  margin-bottom: 6px;
}
.auth-header p {
  font-size: 13px;
  color: var(--text-muted);
}

.submit-btn {
  width: 100%;
  height: 46px;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: .5px;
}

.switch-text {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}
.switch-text a {
  color: var(--primary);
  font-weight: 600;
}
.switch-text a:hover { text-decoration: underline; }

@media (max-width: 720px) {
  .auth-panel { flex-direction: column; width: 100%; }
  .auth-left { width: 100%; padding: 36px 28px; gap: 24px; }
  .auth-right { padding: 36px 28px; }
}
</style>
