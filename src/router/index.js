import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
      { path: 'product/list', name: 'ProductList', component: () => import('@/views/product/ProductList.vue'), meta: { title: '商品列表' } },
      { path: 'product/:id', name: 'ProductDetail', component: () => import('@/views/product/ProductDetail.vue'), meta: { title: '商品详情' } },
      { path: 'cart', name: 'Cart', component: () => import('@/views/cart/Cart.vue'), meta: { title: '购物车', requireAuth: true } },
      { path: 'order/list', name: 'OrderList', component: () => import('@/views/order/OrderList.vue'), meta: { title: '我的订单', requireAuth: true } },
      { path: 'order/:id', name: 'OrderDetail', component: () => import('@/views/order/OrderDetail.vue'), meta: { title: '订单详情', requireAuth: true } },
      { path: 'payment/result', name: 'PaymentResult', component: () => import('@/views/payment/PaymentResult.vue'), meta: { title: '支付结果', requireAuth: true } },
      { path: 'user/info', name: 'UserInfo', component: () => import('@/views/user/UserInfo.vue'), meta: { title: '个人中心', requireAuth: true } },
      { path: 'user/address', name: 'Address', component: () => import('@/views/user/Address.vue'), meta: { title: '收货地址', requireAuth: true } },
      {
        path: 'seller/products', name: 'SellerProducts',
        component: () => import('@/views/seller/ProductManage.vue'),
        meta: { title: '商品管理', requireAuth: true, roles: ['SELLER', 'ADMIN'] }
      },
      {
        path: 'seller/products/add', name: 'SellerProductAdd',
        component: () => import('@/views/seller/ProductForm.vue'),
        meta: { title: '添加商品', requireAuth: true, roles: ['SELLER', 'ADMIN'] }
      },
      {
        path: 'seller/products/:id/edit', name: 'SellerProductEdit',
        component: () => import('@/views/seller/ProductForm.vue'),
        meta: { title: '编辑商品', requireAuth: true, roles: ['SELLER', 'ADMIN'] }
      },
      {
        path: 'seller/categories', name: 'SellerCategories',
        component: () => import('@/views/seller/CategoryManage.vue'),
        meta: { title: '分类管理', requireAuth: true, roles: ['SELLER', 'ADMIN'] }
      },
      {
        path: 'seller/orders', name: 'SellerOrders',
        component: () => import('@/views/seller/SellerOrderManage.vue'),
        meta: { title: '订单管理', requireAuth: true, roles: ['SELLER', 'ADMIN'] }
      },
      {
        path: 'admin/users', name: 'AdminUsers',
        component: () => import('@/views/admin/UserList.vue'),
        meta: { title: '用户管理', requireAuth: true, roles: ['ADMIN'] }
      },
      {
        path: 'admin/review', name: 'ProductReview',
        component: () => import('@/views/admin/ProductReview.vue'),
        meta: { title: '商品审核', requireAuth: true, roles: ['ADMIN'] }
      }
    ]
  },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: '登录' } },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue'), meta: { title: '注册' } },
  { path: '/403', name: 'Forbidden', component: () => import('@/views/error/403.vue'), meta: { title: '禁止访问' } },
  { path: '/500', name: 'ServerError', component: () => import('@/views/error/500.vue'), meta: { title: '服务错误' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/error/404.vue'), meta: { title: '页面不存在' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - CloudMall` : 'CloudMall'

  const userStore = useUserStore()

  // 检查 token 状态：如果 localStorage 中没有 token 但 store 中认为已登录，则清除 store 状态
  if (!isLoggedIn() && userStore.isLogin) {
    userStore.logout()
  }

  if (to.meta.requireAuth && !isLoggedIn()) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 登录状态下如果 userInfo 尚未加载，先等待加载完成
  if (isLoggedIn() && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch {
      if (!isLoggedIn()) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
      } else {
        next({ name: 'ServerError' })
      }
      return
    }
  }

  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRole = userStore.role || 'BUYER'
    if (!to.meta.roles.includes(userRole)) {
      next({ name: 'Forbidden' })
      return
    }
  }

  next()
})

export default router
