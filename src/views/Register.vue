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
  background: linear-gradient(135deg, #f5f6fa 0%, #eff2ff 50%, #f5f6fa 100%);
  padding: 24px;
}

.auth-panel {
  display: flex;
  width: 840px;
  min-height: 560px;
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
  max-width: 220px;
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
  padding: 48px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-header {
  margin-bottom: 28px;
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
