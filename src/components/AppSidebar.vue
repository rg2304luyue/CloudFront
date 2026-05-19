<template>
  <aside class="app-sidebar" :class="{ collapsed: collapsed }">
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      router
      class="sidebar-menu"
    >
      <el-menu-item index="/home">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/product/list">
        <el-icon><Goods /></el-icon>
        <span>商品列表</span>
      </el-menu-item>
      <el-menu-item index="/cart">
        <el-icon><ShoppingCart /></el-icon>
        <span>购物车</span>
        <el-badge v-if="cartStore.totalCount > 0" :value="cartStore.totalCount > 99 ? '99+' : cartStore.totalCount" class="cart-badge" />
      </el-menu-item>
      <el-menu-item index="/order/list">
        <el-icon><Document /></el-icon>
        <span>我的订单</span>
      </el-menu-item>
      <el-menu-item index="/user/info">
        <el-icon><User /></el-icon>
        <span>个人中心</span>
      </el-menu-item>
      <el-menu-item index="/user/address">
        <el-icon><MapLocation /></el-icon>
        <span>收货地址</span>
      </el-menu-item>

      <template v-if="userStore.isSeller || userStore.isAdmin">
        <el-menu-item index="/seller/products">
          <el-icon><Shop /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/seller/categories">
          <el-icon><Collection /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
      </template>
      <template v-if="userStore.isAdmin">
        <el-menu-item index="/admin/review">
          <el-icon><Checked /></el-icon>
          <span>商品审核</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><Setting /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </template>
    </el-menu>

    <div class="sidebar-footer">
      <button class="collapse-btn" @click="collapsed = !collapsed">
        <el-icon :size="16"><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const collapsed = ref(false)

const activeMenu = computed(() => {
  const p = route.path
  if (p.startsWith('/home')) return '/home'
  if (p.startsWith('/product')) return '/product/list'
  if (p.startsWith('/cart')) return '/cart'
  if (p.startsWith('/order')) return '/order/list'
  if (p.startsWith('/user/info')) return '/user/info'
  if (p.startsWith('/user/address')) return '/user/address'
  if (p.startsWith('/seller/products')) return '/seller/products'
  if (p.startsWith('/seller/categories')) return '/seller/categories'
  if (p.startsWith('/admin/review')) return '/admin/review'
  if (p.startsWith('/admin/users')) return '/admin/users'
  return '/home'
})
</script>

<style scoped>
.app-sidebar {
  width: 220px;
  min-height: calc(100vh - 56px - 48px);
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width .2s;
  flex-shrink: 0;
}
.app-sidebar.collapsed { width: 64px; }

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  padding-top: 8px;
}

.sidebar-menu .el-menu-item {
  height: 44px;
  margin: 2px 8px;
  border-radius: 8px;
}
.sidebar-menu .el-menu-item.is-active {
  background: var(--primary-light);
  color: var(--primary);
}

.cart-badge { margin-left: auto; }

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: center;
}
.collapse-btn {
  width: 32px; height: 32px;
  border: 1px solid var(--border); border-radius: 6px;
  background: #fff; color: var(--text-muted);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: color .15s, border-color .15s;
}
.collapse-btn:hover { color: var(--primary); border-color: var(--primary); }
</style>
