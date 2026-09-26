<template>
  <div class="auth-root">
    <div class="auth-panel">
      <!-- Brand Side -->
      <div class="auth-left">
        <div class="brand">
          <div class="brand-icon"><el-icon :size="30"><ShoppingBag /></el-icon></div>
          <h1>CloudMall</h1>
          <p>加入 CloudMall，开启品质购物之旅</p>
        </div>
        <div class="brand-features">
          <div class="feature"><el-icon :size="16"><Checked /></el-icon> 海量好物任你选</div>
          <div class="feature"><el-icon :size="16"><Checked /></el-icon> 支付宝安全支付</div>
          <div class="feature"><el-icon :size="16"><Checked /></el-icon> 卖家/买家双角色</div>
        </div>
      </div>

      <!-- Form Side -->
      <div class="auth-right">
        <div class="auth-header">
          <h2>创建账号</h2>
          <p>注册一个新的 CloudMall 账号</p>
        </div>

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
              {{ loading ? '注册中...' : '注 册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <p class="switch-text">
          已有账号？<router-link to="/login">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const form = reactive({ username: '', password: '', confirmPassword: '', nickname: '' })

watch(() => form.password, () => {
  if (formRef.value && form.confirmPassword) {
    formRef.value.validateField('confirmPassword')
  }
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (_r, v, cb) => v !== form.password ? cb(new Error('密码不一致')) : cb(), trigger: 'blur' }
  ]
}

async function handleRegister() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.register(form.username, form.password, form.nickname || form.username)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
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
  min-height: 580px;
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
  max-width: 220px;
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
