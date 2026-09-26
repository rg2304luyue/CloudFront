<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/home" class="logo">
        <div class="logo-icon"><el-icon :size="18"><ShoppingBag /></el-icon></div>
        <span class="logo-text">CloudMall</span>
      </router-link>
    </div>

    <div class="header-search">
      <el-icon :size="16" color="#86868b"><Search /></el-icon>
      <input
        v-model="searchKeyword"
        aria-label="搜索商品"
        placeholder="搜索商品..."
        class="search-input"
        @keyup.enter="doSearch"
      />
    </div>

    <div class="header-right">
      <template v-if="userStore.isLogin">
        <router-link to="/cart" class="cart-link" title="购物车">
          <el-icon :size="20"><ShoppingCart /></el-icon>
          <span v-if="cartStore.checkedCount > 0" class="cart-dot">
            {{ cartStore.checkedCount > 99 ? '99+' : cartStore.checkedCount }}
          </span>
        </router-link>

        <el-dropdown trigger="click" @command="handleCommand" placement="bottom-end">
          <div class="user-area">
            <el-avatar :size="34" :src="userStore.userInfo?.avatar" class="user-avatar">
              <el-icon :size="18"><UserFilled /></el-icon>
            </el-avatar>
            <span class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}</span>
            <span v-if="userStore.role !== 'BUYER'" class="role-tag" :class="userStore.role">
              {{ userStore.roleLabel }}
            </span>
            <el-icon :size="12" color="#86868b"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="info">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item command="address">
                <el-icon><MapLocation /></el-icon>收货地址
              </el-dropdown-item>
              <el-dropdown-item command="orders">
                <el-icon><Document /></el-icon>我的订单
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <div class="guest-area">
          <router-link to="/login" class="btn btn-ghost btn-sm">登录</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">注册</router-link>
        </div>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const searchKeyword = ref('')

function doSearch() {
  const kw = searchKeyword.value.trim()
  if (kw) {
    router.push({ path: '/product/list', query: { keyword: kw } })
  }
}

function handleCommand(cmd) {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' }).then(() => {
      userStore.logout()
      router.push('/home')
    }).catch(() => {})
  } else if (cmd === 'info') {
    router.push('/user/info')
  } else if (cmd === 'address') {
    router.push('/user/address')
  } else if (cmd === 'orders') {
    router.push('/order/list')
  }
}
</script>

<style scoped>
.app-header {
  position: sticky; top: 0; z-index: 200;
  height: 60px;
  background: var(--glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  padding: 0 32px;
  gap: 24px;
}

/* Logo */
.header-left { display: flex; align-items: center; flex-shrink: 0; }
.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon {
  width: 30px; height: 30px;
  border-radius: 9px;
  background: var(--text);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
}
.logo:hover .logo-icon { transform: scale(1.06); }
.logo-text { font-size: 18px; font-weight: 600; color: var(--text); letter-spacing: -.03em; }

/* Search */
.header-search {
  flex: 1;
  max-width: 460px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(118,118,128,.12);
  border-radius: var(--radius-full);
  padding: 0 16px;
  height: 36px;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}
.header-search:hover { background: rgba(118,118,128,.16); }
.header-search:focus-within {
  background: #fff;
  box-shadow: 0 0 0 1px var(--primary) inset, var(--primary-ring);
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text);
}
.search-input::placeholder { color: var(--text-muted); }

/* Right */
.header-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.cart-link {
  position: relative;
  width: 38px; height: 38px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.cart-link:hover { background: var(--bg-hover); color: var(--primary); }
.cart-dot {
  position: absolute;
  top: 2px; right: 1px;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  min-width: 17px; height: 17px;
  line-height: 17px;
  text-align: center;
  border-radius: var(--radius-full);
  padding: 0 4px;
  box-shadow: 0 0 0 2px #fff;
}

/* User */
.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 12px 3px 3px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.user-area:hover { background: var(--bg-hover); }

.user-avatar {
  background: linear-gradient(180deg, #c7c7cc, #a1a1a6);
  color: #fff;
  flex-shrink: 0;
}

.user-name {
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.role-tag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  font-weight: 600;
  letter-spacing: .02em;
}
.role-tag.SELLER { background: var(--primary-light); color: var(--primary); }
.role-tag.ADMIN { background: var(--danger-light); color: var(--danger); }

/* Guest */
.guest-area {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .app-header { padding: 0 16px; gap: 12px; }
  .header-search { max-width: none; padding: 0 12px; }
  .user-name, .role-tag, .user-area > .el-icon { display: none; }
  .user-area { padding-right: 3px; }
}

@media (max-width: 480px) {
  .logo-text { display: none; }
  .guest-area .btn { padding: 5px 10px; }
}
</style>
