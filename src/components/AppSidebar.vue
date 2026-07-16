<template>
  <aside class="app-sidebar" :class="{ collapsed: collapsed }">
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      router
      class="sidebar-menu"
    >
      <div class="menu-section-label" v-show="!collapsed">导航</div>
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
        <span v-show="!collapsed && cartStore.checkedCount > 0" class="cart-badge">
          {{ cartStore.checkedCount > 99 ? '99+' : cartStore.checkedCount }}
        </span>
      </el-menu-item>

      <div class="menu-section-label" v-show="!collapsed">个人</div>
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
        <div class="menu-section-label" v-show="!collapsed">商家</div>
        <el-menu-item index="/seller/products">
          <el-icon><Shop /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/seller/categories">
          <el-icon><Collection /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
                <el-menu-item index="/seller/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
      </template>

      <template v-if="userStore.isAdmin">
        <div class="menu-section-label" v-show="!collapsed">管理</div>
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
      <button class="collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? '展开菜单' : '收起菜单'">
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
  if (p.startsWith('/seller/orders')) return '/seller/orders'
  return '/home'
})
</script>

<style scoped>
.app-sidebar {
  width: 230px;
  min-height: calc(100vh - 56px - 48px);
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-slow);
  flex-shrink: 0;
  overflow: hidden;
}
.app-sidebar.collapsed { width: 66px; }

/* Menu */
.sidebar-menu {
  flex: 1;
  border-right: none !important;
  padding: 10px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

.menu-section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .8px;
  padding: 14px 14px 6px;
  white-space: nowrap;
}

.sidebar-menu .el-menu-item {
  height: 42px;
  margin: 1px 0;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.sidebar-menu .el-menu-item:hover {
  background: var(--bg-hover);
  color: var(--text);
}
.sidebar-menu .el-menu-item.is-active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}
.sidebar-menu .el-menu-item.is-active .el-icon {
  color: var(--primary);
}

.cart-badge {
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  padding: 0 5px;
  flex-shrink: 0;
  margin-left: auto;
}

/* Footer */
.sidebar-footer {
  padding: 10px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: center;
}
.collapse-btn {
  width: 34px; height: 34px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.collapse-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
  background: var(--primary-light);
}

@media (max-width: 768px) {
  .app-sidebar { display: none; }
}
</style>
