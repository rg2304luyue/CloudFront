<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/home" class="logo">
        <div class="logo-icon"><el-icon :size="20"><ShoppingBag /></el-icon></div>
        <span>CloudMall</span>
      </router-link>
    </div>

    <div class="header-right">
      <template v-if="userStore.isLogin">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-area">
            <el-avatar :size="32" :src="userStore.userInfo?.avatar" class="user-avatar-icon">
              <el-icon :size="18"><UserFilled /></el-icon>
            </el-avatar>
            <span class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}</span>
            <span v-if="userStore.role !== 'BUYER'" class="role-tag" :class="userStore.role">{{ userStore.roleLabel }}</span>
            <el-icon :size="12"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="info"><el-icon><User /></el-icon>个人中心</el-dropdown-item>
              <el-dropdown-item command="address"><el-icon><MapLocation /></el-icon>收货地址</el-dropdown-item>
              <el-dropdown-item divided command="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <div class="user-area guest" @click="goLogin">
          <el-avatar :size="32" :icon="UserFilled" class="user-avatar-icon" />
          <span class="login-text">点击登录</span>
        </div>
      </template>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

function goLogin() {
  router.push('/login')
}

function handleCommand(cmd) {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' }).then(() => {
      userStore.logout()
      cartStore.items = []
      router.push('/home')
    }).catch(() => {})
  } else if (cmd === 'info') {
    router.push('/user/info')
  } else if (cmd === 'address') {
    router.push('/user/address')
  }
}
</script>

<style scoped>
.app-header {
  position: sticky; top: 0; z-index: 200;
  height: 56px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left { display: flex; align-items: center; }
.logo { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: var(--text); }
.logo-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; }

.header-right { display: flex; align-items: center; }

.user-area {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 12px 4px 4px; border-radius: 20px;
  cursor: pointer; transition: background .15s;
}
.user-area:hover { background: #f3f4f6; }
.user-area.guest { padding: 4px 16px 4px 4px; }

.user-avatar-icon { background: var(--primary-light); color: var(--primary); }
.guest .user-avatar-icon { background: #f3f4f6; color: var(--text-muted); }

.user-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--text-secondary); }
.role-tag { font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 500; }
.role-tag.SELLER { background: #e6f7ff; color: #1890ff; }
.role-tag.ADMIN { background: #fff1f0; color: #f5222d; }
.login-text { font-size: 13px; color: var(--text-muted); }
</style>
