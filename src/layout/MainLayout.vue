<template>
  <el-container class="layout-container">
    <!-- 顶部导航 -->
    <el-header class="layout-header">
      <div class="header-left">
        <router-link to="/home" class="logo">
          <el-icon :size="24"><ShoppingBag /></el-icon>
          <span>CloudMall</span>
        </router-link>
      </div>
      <div class="header-center">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          router
          class="header-menu"
        >
          <el-menu-item index="/home">首页</el-menu-item>
          <el-menu-item index="/product/list">商品</el-menu-item>
          <el-menu-item index="/cart">购物车
            <el-badge v-if="cartStore.totalCount > 0" :value="cartStore.totalCount" :offset="[6, -6]" />
          </el-menu-item>
          <el-menu-item index="/order/list">我的订单</el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <template v-if="userStore.isLogin">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-icon><UserFilled /></el-icon>
              {{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="info">个人中心</el-dropdown-item>
                <el-dropdown-item command="address">收货地址</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" size="small" @click="$router.push('/login')">登录</el-button>
          <el-button size="small" @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </el-header>

    <!-- 主体内容 -->
    <el-main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <!-- 底部 -->
    <el-footer class="layout-footer">
      <span>© 2025 CloudMall 电商平台 | 基于 Spring Cloud Alibaba 微服务架构</span>
    </el-footer>
  </el-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/home')) return '/home'
  if (path.startsWith('/product')) return '/product/list'
  if (path.startsWith('/cart')) return '/cart'
  if (path.startsWith('/order')) return '/order/list'
  return ''
})

onMounted(() => {
  if (userStore.isLogin) {
    cartStore.fetchCart()
  }
})

function handleCommand(command) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' }).then(() => {
      userStore.logout()
      cartStore.items = []
      router.push('/home')
    }).catch(() => {})
  } else if (command === 'info') {
    router.push('/user/info')
  } else if (command === 'address') {
    router.push('/user/address')
  }
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
  padding: 0 40px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.header-menu {
  border-bottom: none !important;
}
.header-menu .el-menu-item {
  height: 60px;
  line-height: 60px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #606266;
}
.user-dropdown:hover {
  color: #409eff;
}

.layout-main {
  flex: 1;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.layout-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 13px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
