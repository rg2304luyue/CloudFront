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
  background:
    radial-gradient(ellipse 50% 40% at 15% 10%, rgba(90,200,250,.14), transparent 70%),
    radial-gradient(ellipse 50% 45% at 90% 95%, rgba(0,113,227,.12), transparent 70%),
    var(--bg);
  padding: 24px;
}

.auth-panel {
  display: flex;
  width: 920px;
  max-width: 100%;
  min-height: 520px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,.10), 0 0 0 1px rgba(0,0,0,.04);
  background: var(--bg-card);
  animation: pop .6s var(--ease) both;
}

@keyframes pop {
  from { opacity: 0; transform: translateY(12px) scale(.985); }
  to { opacity: 1; transform: none; }
}

/* Left Brand */
.auth-left {
  position: relative;
  width: 360px;
  background:
    radial-gradient(ellipse 90% 60% at 50% 110%, rgba(0,113,227,.55), transparent 70%),
    radial-gradient(ellipse 70% 50% at 0% 0%, rgba(191,90,242,.22), transparent 70%),
    #0b0b0d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #f5f5f7;
  padding: 48px 36px;
  gap: 44px;
  overflow: hidden;
}

.brand { text-align: center; position: relative; }
.brand-icon {
  width: 68px; height: 68px;
  border-radius: 20px;
  background: rgba(255,255,255,.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.14), 0 10px 30px rgba(0,0,0,.3);
}
.brand h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -.03em;
  margin-bottom: 8px;
}
.brand p {
  font-size: 14px;
  color: rgba(245,245,247,.62);
  line-height: 1.5;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 200px;
  position: relative;
}
.feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(245,245,247,.82);
}
.feature .el-icon { color: #64d2ff; }

/* Right Form */
.auth-right {
  flex: 1;
  padding: 56px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-header {
  margin-bottom: 32px;
}
.auth-header h2 {
  font-size: 34px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.03em;
  margin-bottom: 8px;
  line-height: 1.15;
}
.auth-header p {
  font-size: 15px;
  color: var(--text-secondary);
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: .02em;
  margin-top: 4px;
}

.switch-text {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.switch-text a {
  color: var(--primary);
  font-weight: 500;
}
.switch-text a:hover { text-decoration: underline; }

@media (max-width: 720px) {
  .auth-panel { flex-direction: column; width: 100%; }
  .auth-left { width: 100%; padding: 36px 28px; gap: 24px; }
  .auth-right { padding: 36px 28px; }
}
</style>
