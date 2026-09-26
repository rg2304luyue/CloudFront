# CloudFront 电商前端

Vue 3 + Vite + Element Plus + Pinia + Vue Router，配合 CloudBack 微服务后端。

## 技术栈

| 层级 | 技术 | 版本 |
|---|---|---|
| 框架 | Vue | 3.5 |
| 构建 | Vite | 6.x |
| UI | Element Plus | 2.9 |
| 路由 | Vue Router | 4.5 |
| 状态管理 | Pinia | 2.3 |
| HTTP | Axios | 1.7 |
| 图标 | @element-plus/icons-vue | 2.3 |
| 按需引入 | unplugin-auto-import / unplugin-vue-components（ElementPlusResolver） | 21 / 32 |

`vite.config.js`：开发端口 5173，`/api` 代理到 `http://localhost:8080`（CloudBack 网关），别名 `@` → `/src`。Element Plus 组件及其样式由插件按需自动引入；命令式服务（MessageBox / Message / Notification）的 CSS 在 `main.js` 中显式导入。

## 项目结构

```text
CloudFront/
├── index.html                           # HTML 入口
├── vite.config.js                       # Vite 配置，/api 代理 → localhost:8080
├── package.json
├── auto-imports.d.ts / components.d.ts  # 按需引入插件生成的类型声明
├── tests/                               # Node 原生测试（node:test + node:vm）
│   ├── checkout-request.test.mjs        #   下单请求恢复状态机（10 项）
│   └── payment-result.test.mjs          #   支付结果页轮询与判定（5 项）
└── src/
    ├── main.js                          # 入口：注册 Vue/Pinia/Router/ElementPlus/图标；显式导入命令式服务 CSS（MessageBox/Message/Notification）
    ├── App.vue                          # 根组件，挂载时恢复登录态
    │
    ├── api/                             # 后端 API 封装（按微服务拆分）
    │   ├── auth.js                      #   登录 / 注册
    │   ├── user.js                      #   个人信息 / 地址 / 管理员接口
    │   ├── product.js                   #   商品 CRUD / 分类 / 热门 / 审核
    │   ├── cart.js                      #   购物车 CRUD
    │   ├── order.js                     #   订单创建 / 查询 / 取消 / 确认收货 / 卖家订单
    │   └── payment.js                   #   发起支付宝支付 / 支付记录查询
    │
    ├── stores/                          # Pinia 状态管理
    │   ├── user.js                      #   登录态、用户信息、角色
    │   └── cart.js                      #   购物车列表、勾选统计
    │
    ├── router/
    │   └── index.js                     # 22 条路由 + 登录守卫 + 角色守卫
    │
    ├── layout/
    │   └── MainLayout.vue               # 顶栏 + 侧栏 + 内容 + 底栏 框架
    │
    ├── components/                      # 公共组件
    │   ├── AppHeader.vue                #   顶栏：Logo + 全局搜索 + 购物车角标 + 头像下拉菜单
    │   ├── AppSidebar.vue               #   侧栏：按角色条件渲染的 el-menu（可收起）
    │   ├── AppFooter.vue                #   底栏
    │   ├── ProductCard.vue              #   商品卡片：图片 + 名称 + 价格 + 销量 + hover 动画
    │   ├── PageHeader.vue               #   页面标题栏：返回按钮 + 标题 + 副标题 + 操作槽位
    │   ├── AvatarCropper.vue            #   头像裁剪：拖拽定位 + 缩放 + Canvas 裁剪输出
    │   ├── EmptyState.vue               #   空数据占位（图标 + 描述 + 按钮）
    │   └── LoadingState.vue             #   加载中占位（旋转动画）
    │
    ├── views/                           # 21 个页面视图
    │   ├── Home.vue                     #   首页：Hero Banner + 热门商品网格
    │   ├── Login.vue                    #   登录页（独立布局）
    │   ├── Register.vue                 #   注册页（独立布局）
    │   ├── error/                       #   403 / 404 / 500 错误页
    │   ├── product/                     #   ProductList、ProductDetail
    │   ├── cart/                        #   Cart（表格 + 结算弹窗）
    │   ├── order/                       #   OrderList、OrderDetail
    │   ├── payment/                     #   PaymentResult
    │   ├── user/                        #   UserInfo、Address
    │   ├── seller/                      #   ProductManage、ProductForm、CategoryManage、SellerOrderManage
    │   └── admin/                       #   UserList、ProductReview、OutboxManage
    │
    ├── assets/
    │   ├── global.css                   # 设计令牌、重置、布局/卡片/按钮/徽标工具类、订单状态色、Element Plus 主题覆盖
    │   ├── element-plus.css             # 仅两条层级规则：.el-overlay 与 MessageBox 的 z-index
    │   └── error-page.css               # 错误页公共样式（403/404/500 通过 <style scoped src> 引用）
    │
    ├── data/
    │   └── regions.json                 # 中国省市区三级数据（供 el-cascader 使用）
    │
    ├── constants/
    │   └── orderStatus.js               # 订单状态映射 + ORDER_STATUS 命名常量
    │
    ├── composables/
    │   ├── useCheckoutRequest.js        # 下单请求状态机（令牌复用 / 提交 / 结果轮询 / 会话恢复）
    │   ├── usePayment.js                # 支付宝支付处理（同步开窗防拦截）
    │   ├── usePolling.js                # 通用轮询（setTimeout 链 + visibilitychange 自动暂停/恢复）
    │   └── usePagination.js             # 通用分页逻辑（当前没有页面引用）
    └── utils/
        ├── request.js                   # Axios 实例 + 请求/响应拦截器
        └── auth.js                      # localStorage 读写 Token/用户
```

### utils/auth.js

```js
getToken() / setToken(token) / removeToken()     // Token 增删改查
getUser() / setUser(user) / removeUser()         // 用户对象 JSON 序列化存取
isLoggedIn()                                     // !!getToken()
logout()                                         // 清 token + 用户
```

---

## 路由表

22 条路由（17 条 MainLayout 子路由 + `/login`、`/register`、`/403`、`/500`、`/:pathMatch(.*)*`；`/` 为重定向包装），`/login` 和 `/register` 为独立全屏页面，其余由 `MainLayout` 包裹。

| 路径 | 页面 | 认证 | 角色限制 | 说明 |
|---|---|---|---|---|
| `/home` | Home.vue | 否 | — | Hero Banner + 热门商品 |
| `/product/list` | ProductList.vue | 否 | — | 搜索框 + 分类下拉 + 分页网格 |
| `/product/:id` | ProductDetail.vue | 否 | — | 商品详情 + 加入购物车 |
| `/login` | Login.vue | 否 | — | 独立布局，登录后跳回 `?redirect`，无参数时跳首页 |
| `/register` | Register.vue | 否 | — | 独立布局 |
| `/cart` | Cart.vue | 是 | — | 购物车表格 + 下单弹窗 |
| `/order/list` | OrderList.vue | 是 | — | 订单卡片列表 |
| `/order/:id` | OrderDetail.vue | 是 | — | 订单详情 + 立即支付按钮 |
| `/payment/result` | PaymentResult.vue | 是 | — | 支付结果（成功/处理中/失败） |
| `/user/info` | UserInfo.vue | 是 | — | 个人信息 + 申请卖家 |
| `/user/address` | Address.vue | 是 | — | 地址 CRUD（省市区三级联动选择） |
| `/seller/products` | ProductManage.vue | 是 | SELLER, ADMIN | 商品管理表格 |
| `/seller/products/add` | ProductForm.vue | 是 | SELLER, ADMIN | 添加商品 |
| `/seller/products/:id/edit` | ProductForm.vue | 是 | SELLER, ADMIN | 编辑商品（复用表单） |
| `/seller/categories` | CategoryManage.vue | 是 | SELLER, ADMIN | 分类树管理 |
| `/seller/orders` | SellerOrderManage.vue | 是 | SELLER, ADMIN | 卖家订单管理 + 发货 |
| `/admin/users` | UserList.vue | 是 | ADMIN | 用户管理 + 卖家申请审批 |
| `/admin/review` | ProductReview.vue | 是 | ADMIN | 商品审核 |
| `/admin/outbox` | OutboxManage.vue | 是 | ADMIN | 失败 Outbox 消息查看与重放 |
| `/403` | 403.vue | 否 | — | 无权限 |
| `/500` | 500.vue | 否 | — | 服务错误 |
| `/:pathMatch(.*)*` | 404.vue | 否 | — | 页面不存在 |

### 路由守卫（`router.beforeEach`）

```text
1. 设置 document.title
2. 未登录但 store 认为已登录 → 先 userStore.logout()（同步 token 状态）
3. 若 to.meta.requireAuth && !isLoggedIn()
   → redirect: /login?redirect=<原路径>
4. 已登录且 userInfo 未加载 → await fetchUserInfo()（失败时未登录跳 /login，否则跳 /500）
5. 若 to.meta.roles 存在
   从 Pinia userStore 读用户角色（默认 BUYER）
   若角色不在允许列表 → redirect: /403
```

---

## 认证流程

### 登录

```text
Login.vue 提交表单
  → userStore.login(username, password)
    → POST /api/auth/login (JSON body: {username, password})
    → 响应 token 字符串
    → 存 Pinia ref + localStorage['cloud_token']
  → userStore.fetchUserInfo()
    → GET /api/users/me（带 Authorization 头）
    → 存 Pinia ref + localStorage['cloud_user']
  → cartStore.fetchCart()
    → GET /api/cart → 初始化购物车
  → 路由跳转
    → ?redirect 参数存在 → 跳回原页面
    → 否则统一跳转到 /home
```

### 注册

```text
Register.vue 提交表单
  → userStore.register(username, password, nickname)
    → POST /api/auth/register (JSON body: {username, password, nickname})
    → 不自动登录
    → ElMessage "注册成功" → router.push('/login')
```

### 启动恢复

```text
App.vue onMounted
  → 若 localStorage 有 token
    → userStore.fetchUserInfo() 恢复用户状态
```

### 登出

```text
AppHeader 退出按钮
  → ElMessageBox.confirm("确定要退出登录吗？")
  → userStore.logout()      ← 清 token + userInfo + localStorage，并在内部调用 cartStore.reset()
  → router.push('/home')
```

### localStorage 键

| 键 | 值 |
|---|---|
| `cloud_token` | JWT 字符串 |
| `cloud_user` | JSON 序列化的用户对象 |

---

## Axios 拦截器（`utils/request.js`）

### 请求拦截器

```text
每次请求前从 localStorage 读取 token
→ config.headers.Authorization = 'Bearer ' + token
```

### 响应拦截器 — 成功

```text
检查 res.data.code:
  code !== 200 → ElMessage.error(res.data.message)
               → reject(Error)，error.code = 业务码（useCheckoutRequest 依赖 42201 判断）
  code === 401 → 额外执行 handleUnauthorized()
成功时返回 res.data（即 R<T>），调用方读取 r.data
```

`handleUnauthorized()`：移除 token → 派发 `cloud-auth-expired` 事件（`App.vue` 监听后调用 `userStore.logout()`，同时清用户与购物车）→ 当前不在登录页时 `router.push({ name: 'Login', query: { redirect: 当前完整路径 } })`。这是路由跳转，不会整页刷新。

### 响应拦截器 — 错误

| HTTP 状态码 | 处理 |
|---|---|
| 401 | `handleUnauthorized()`（见上） |
| 403 | `ElMessage.error("没有访问权限")` |
| 500 | `ElMessage.error("服务内部错误")` |
| 无 response | `ElMessage.error("网络异常，请检查网络连接")` |
| 其他 | `ElMessage.error("请求失败: " + status)` |

---

## 状态管理

### userStore（`stores/user.js`）

**State**：`token`、`userInfo`

**Getters**：

| 属性 | 逻辑 |
|---|---|
| `isLogin` | `!!token` |
| `role` | `userInfo?.role \|\| 'BUYER'` |
| `isSeller` | `role === 'SELLER'` |
| `isAdmin` | `role === 'ADMIN'` |
| `roleLabel` | `{ BUYER: '买家', SELLER: '卖家', ADMIN: '管理员' }` |

**Actions**：`login()`、`register()`、`fetchUserInfo()`、`logout()`

### cartStore（`stores/cart.js`）

**State**：`items`（Array\<CartItem\>）

**Getters**：

| 属性 | 逻辑 |
|---|---|
| `checkedCount` | 勾选商品的行数（items.filter(i => i.checked).length） |
| `totalPrice` | checked 商品的 `price × quantity` 总和 |

**Actions**：`fetchCart()`、`add()`、`updateQty()`、`toggleCheck()`、`checkAll()`、`remove()`、`clear()`、`reset()`

| Action | 行为 |
|---|---|
| `fetchCart()` | GET /api/cart → 赋值 `items`；仅 401 认证失败时清空，网络/服务错误保留原数据 |
| `add(productId, qty)` | POST /api/cart/items → 自动 `fetchCart()` 同步 |
| `updateQty(id, qty)` | 乐观更新：立即修改本地 quantity，失败回滚旧值 |
| `toggleCheck(id, checked)` | 乐观更新：立即修改本地 checked，失败回滚 |
| `checkAll(checked)` | PATCH /api/cart/items/check-all，乐观更新全部 checked，失败回滚 |
| `remove(productId)` | 乐观更新：立即从本地删除，失败回滚还原 |
| `clear()` | DELETE /api/cart/items → 本地 `items = []` |
| `reset()` | 本地重置 `items = []`，不调 API（登出时使用，避免 401） |

---

## API 层

所有 API 函数返回 Axios Promise，响应格式为 `R<T> = { code, message, data }`。

### auth.js
```js
login(username, password)              // POST /api/auth/login (JSON body: {username, password})
register(username, password, nickname) // POST /api/auth/register (JSON body: {username, password, nickname})
```

### user.js
```js
getUserInfo()                          // GET /api/users/me
updateUserInfo(data)                   // PATCH /api/users/me (JSON body)
getAddressList()                       // GET /api/users/me/addresses
getAddressById(id)                     // GET /api/users/me/addresses/:id
addAddress(data)                       // POST /api/users/me/addresses
updateAddress(id, data)                // PUT /api/users/me/addresses/:id
deleteAddress(id)                      // DELETE /api/users/me/addresses/:id
getUserList()                          // GET /api/admin/users
resetPassword(id, newPassword)         // PATCH /api/admin/users/:id/password (JSON body)
applySeller()                          // POST /api/users/me/seller-applications
getApplications()                      // GET /api/admin/applications
processApplication(id, approved)       // PATCH /api/admin/applications/:id (JSON body)
uploadAvatar(file)                     // POST /api/users/me/avatar (FormData)
```

### product.js
```js
getCategoryTree()                      // GET /api/categories
addCategory(data)                      // POST /api/categories
updateCategory(id, data)               // PUT /api/categories/:id
deleteCategory(id)                     // DELETE /api/categories/:id
getProductDetail(id)                   // GET /api/products/:id
getProductList({ categoryId, page, size, keyword, sortBy })  // GET /api/products（sortBy: price_asc / price_desc / sales）
getHotProducts()                       // GET /api/products/hot
getMyProducts({ page, size })          // GET /api/seller/products/mine
addProduct(data)                       // POST /api/seller/products
updateProduct(id, data)                // PUT /api/seller/products/:id
deleteProduct(id)                      // DELETE /api/seller/products/:id
getPendingProducts({ page, size })     // GET /api/admin/products/pending
reviewProduct(id, approved)            // PATCH /api/admin/products/:id/review (JSON body)
uploadImage(file)                      // POST /api/products/upload (FormData)
```

### cart.js
```js
getCartList()                          // GET /api/cart
getCheckedItems()                      // GET /api/cart/checked
addToCart(productId, quantity)         // POST /api/cart/items (JSON body)
updateQuantity(productId, quantity)    // PATCH /api/cart/items/:productId (JSON body)
checkItem(productId, checked)          // PATCH /api/cart/items/:productId/check (JSON body)
removeFromCart(productId)              // DELETE /api/cart/items/:productId
clearCart()                            // DELETE /api/cart/items
checkAllItems(checked)                   // PATCH /api/cart/items/check-all (JSON body)
```

### order.js
```js
createOrder(addressId, remark, orderToken) // POST /api/orders (JSON body: {addressId, remark, orderToken})
getOrderDetail(id)                     // GET /api/orders/:id
getOrderByNo(orderNo)                  // GET /api/orders/by-no/:orderNo（支付结果页核对）
getOrderList({ page, size })           // GET /api/orders
cancelOrder(id)                        // PATCH /api/orders/:id/cancel
receiveOrder(id)                       // PATCH /api/orders/:id/receive
getSellerOrders({ page, size })        // GET /api/seller/orders
shipOrder(id)                          // PATCH /api/seller/orders/:id/ship
getOrderToken()                        // GET /api/orders/token
getOrderRequest(orderToken)            // GET /api/orders/requests/:token（下单请求状态）
getFailedOutboxMessages(limit = 50)    // GET /api/orders/admin/outbox/failed?limit=（ADMIN）
retryFailedOutboxMessage(id)           // POST /api/orders/admin/outbox/:id/retry（ADMIN）
```

### payment.js
```js
createAlipayPayment(orderNo)             // POST /api/payment/alipay (JSON body: {orderNo, method: 'ALIPAY'})，返回支付表单 HTML
getPaymentByOrderNo(orderNo)             // GET /api/payment/:orderNo（后端会按需向支付宝同步状态）
```

---

## 布局系统

```
┌──────────────────────────────────────────────────────┐
│  AppHeader (60px, sticky, 毛玻璃)                      │
│  Logo(左)     全局搜索(居中)     购物车 / 头像菜单(右)  │
├──────────────┬───────────────────────────────────────┤
│ AppSidebar   │  <main> → <router-view>               │
│ 240px, sticky│  各页面根元素使用 .page-container：     │
│ 可收起至72px  │  padding 48px 40px 72px,              │
│              │  max-width 1320px, 居中               │
│ el-menu      │                                       │
│ router 模式   │                                       │
│ 按角色条件    │                                       │
│ 渲染菜单项    │                                       │
├──────────────┴───────────────────────────────────────┤
│  AppFooter：品牌简介 / 快速链接 / 个人中心 / 技术栈 四列  │
│  © 2025 CloudMall. All rights reserved.              │
└──────────────────────────────────────────────────────┘
```

- `MainLayout.vue`：flex column 全局框架，flex row 分配侧栏+内容
- `AppHeader`：sticky 顶栏，60px 高度，毛玻璃背景（`--glass` + `backdrop-filter`），z-index 200（低于 Element Plus 遮罩的 2000+）
  - Logo 左侧链接到 `/home`
  - 全局搜索栏（始终显示）：输入关键词 → 回车 → router.push 到 `/product/list?keyword=xxx`
  - 购物车图标 + 红色角标（仅登录后显示；数字为**已勾选**商品行数 `checkedCount`，为 0 时隐藏，>99 显示 99+）
  - 用户头像 + 昵称（过长截断）+ 角色标签（SELLER 蓝色 / ADMIN 红色）
  - 下拉菜单：个人中心 / 收货地址 / 我的订单 / 退出登录
  - 未登录状态：显示"登录"和"注册"按钮
- `AppSidebar`：240px 宽度，可收起至 72px；`position: sticky; top: 60px`，菜单过长时内部滚动
  - `activeMenu` 由 `route.path` 的 prefix 匹配决定高亮项
  - 菜单分组标签：导航（首页/商品/购物车）、个人（订单/中心/地址）、商家（商品管理/分类管理/订单管理，SELLER/ADMIN 可见）、管理（商品审核/用户管理/失败消息，仅 ADMIN）
  - 选中项为浅蓝底色 + 蓝色文字
  - 购物车菜单项右侧显示已勾选数量角标（max 99+）
  - 底部收起/展开按钮（Fold/Expand 图标切换）
  - 收起时：菜单仅显示图标，分组标签隐藏，角标隐藏
- 页面过渡：`<transition name="page" mode="out-in">`
  - enter: opacity 0→1, translateY(8px)→0
  - leave: opacity 1→0（无位移）
  - 持续时间 220ms，缓动 `var(--ease)`
- 响应式断点：
  - 1024px：商品网格 4→3 列
  - 768px：商品网格 3→2 列，侧栏隐藏，筛选栏纵向排列，购物车表格隐藏单价/小计列，page-container padding 缩小
  - 480px：通用 `.grid-2/3/4` 工具类变为 1 列（首页与商品列表网格保持 2 列），顶栏隐藏 Logo 文字

---

## 视觉与样式体系

整体采用接近 Apple 官网的简洁风格：大字号标题、充足留白、白色卡片配柔和阴影、胶囊形按钮、毛玻璃顶栏与悬浮结算栏。

- **设计令牌**（`global.css` 的 `:root`）：
  - 颜色：`--primary #0071e3`、`--text #1d1d1f`、`--text-secondary #6e6e73`、`--bg #f5f5f7`，语义色 `--danger / --success / --warning` 及对应 `-light` 底色
  - 表面：`--glass`（半透明白）+ `--glass-blur`；`--border / --border-light` 为低透明度黑色
  - 圆角 `--radius-sm / --radius / --radius-lg / --radius-xl / --radius-full`，阴影 `--shadow-xs … --shadow-lg`
  - 字体 `--font-sans`（-apple-system / SF Pro / PingFang SC，Windows 回退微软雅黑）、`--font-mono`
  - 动效 `--ease`、`--transition-fast / --transition / --transition-slow`；系统开启"减少动态效果"时关闭动画
- **公共类**：`.page-container`、`.page-title`、`.page-head`、`.card`、`.table-card`（后台表格外框）、`.pagination-wrap`、`.btn` 系列（`btn-primary / btn-ghost / btn-danger / btn-outline-danger / btn-sm / btn-lg`，均为胶囊形）、`.badge`、`.status-0 … .status-4`（订单状态色）、文本与间距工具类。
- **Element Plus 覆盖**：写在 `global.css` 末尾。组件样式由插件在运行时按需注入，加载顺序晚于 `global.css`，所以覆盖选择器统一加 `html` 前缀提高优先级，不依赖 `!important`。覆盖范围：输入框/选择器聚焦环、胶囊按钮、弹窗与 MessageBox 圆角、遮罩模糊、表格（透明表头、细分隔线）、标签、分页（当前页深色）、下拉菜单。
- **页面内样式**：组件使用 `<style scoped>`，需要作用到 Element Plus 内部元素时用 `:deep()`。三个错误页共用 `assets/error-page.css`。
- **与行为相关的类名**（改样式时需保留）：`.product-grid.is-switching`（翻页时 `pointer-events: none`）、`.app-sidebar.collapsed`、`'status-' + order.status`、`.role-tag.SELLER / .ADMIN`、`.addr-card.is-default`、`.file-input { display: none }`（通过 ref 的 `.click()` 打开文件选择）。`AvatarCropper` 中 300px 图片和 200px 圆形蒙版的尺寸与裁剪计算耦合，不能单独修改。

---

## 各页面功能详解

### 首页（Home.vue）

```
Hero Banner → 白底柔和光晕 + 渐变大标题"发现好物，品质生活" + 立即选购 / 浏览分类按钮
热门商品   → getHotProducts() → 4列网格 ProductCard
           每张卡片：1:1 图片 + 名称(单行省略) + 价格 + 销量；hover 轻微上浮、图片缓慢放大
           右上角"查看全部"链接 → /product/list
           点击卡片（或键盘 Enter / Space）→ /product/:id
状态处理   → LoadingState（加载中）/ 加载失败 + 重新加载按钮 / EmptyState（无商品）
```

### 商品列表（ProductList.vue）

```
搜索栏 → 原生 <input> 胶囊搜索框（回车搜索，有内容时显示清空图标）
        + 分类下拉(el-select，分类树展平)
        排序下拉：默认排序 / 价格从低到高 / 价格从高到低 / 销量优先
        选分类/排序 → @change → search() → 重置 page=1 → fetchProducts()
        watch route.query.keyword → 已在列表页时搜索自动刷新（路由复用同一组件）
商品网格 → 4列，ProductCard 组件
分页   → el-pagination，切换页码：
         初次加载：全屏 LoadingState → 数据就位
         翻页切换：保留当前商品，网格加 .is-switching（opacity 0.5、禁止点击，0.2s 过渡），数据返回后替换
状态   → LoadingState（初次空状态）/ EmptyState（加载失败 + 重新加载）/ EmptyState（筛选无结果 + 清除筛选）
```

### 商品详情（ProductDetail.vue）

```
左栏 → 商品图片 480px 正方形（el-image + 加载失败占位图标）
右栏 → 名称(34px 标题) + 描述
        价格区（上下细分隔线）：价格(34px 深色) + 库存 + 已售件数
        数量选择器(1-库存上限) + 库存≤10 时显示"仅剩 N 件"橙色提示
        操作按钮：加入购物车(浅蓝胶囊；类名仍是 btn-outline-danger，在页面内覆盖) + 立即购买(实心蓝)
        库存为 0 时两个按钮都显示"已售罄"并禁用
加入购物车 → 未登录跳 /login → 已登录 cartStore.add() → ElMessage 成功
立即购买   → 同上 + router.push('/cart')
加载失败   → EmptyState "商品不存在" + 返回按钮
响应式     → 900px 以下改为纵向布局，图片宽度 100%
```

### 购物车（Cart.vue）

```
PageHeader → 标题"购物车" + 副标题"管理你的购物清单"
表格视图 → 表头/每行：勾选框 | 缩略图(80px) | 商品名 | 单价 | 数量(el-input-number，独立防抖，避免多商品互锁) | 小计(price×quantity) | 删除
         行 hover 变背景色，缩略图和商品名可点击跳转商品详情
全选     → 顶部勾选框 + 底栏全选复选框，支持半选状态（indeterminate）
         toggleAll → cartStore.checkAll(v)（一次 PATCH）；下单请求锁定期间不执行
粘性底栏 → 毛玻璃胶囊条，position: sticky; bottom: 20px; 始终可见
         全选 + 清空购物车 | 已选N件 合计¥XX | 去结算按钮（蓝色）
下单恢复 → 有未完成的下单请求时，页面顶部显示提示条和「继续查询下单结果」「查看并重试原请求」按钮；
         锁定期间勾选、改数量、删除、清空全部禁用
结算弹窗 → el-dialog（min(560px, calc(100vw - 32px))，不可点击遮罩关闭）
         收货地址 select（默认选中默认地址，无地址提示"去添加"）
         商品清单列表（名称 ×数量 + 小计）| 备注(选填)
         合计金额 | 提交订单按钮（有 loading 状态）
         提交 → 交给 useCheckoutRequest（见「共享模块」）；SUCCEEDED 后跳转订单详情
响应式   → 768px 以下隐藏单价/小计列，底栏纵向排列
```

### 订单列表（OrderList.vue）

```
卡片列表 → 每张卡片：订单号 + 下单时间 + 状态徽标(颜色区分) + 订单金额 + 收货地址
         点击卡片主体 → /order/:id；每 15 秒后台静默刷新
         待支付订单显示"立即支付"和"取消订单"按钮
         点击"立即支付" → usePayment：点击后按钮禁用并显示"正在准备…"（直到支付窗口关闭），在新窗口提交支付宝表单
         已发货订单显示"确认收货"按钮
分页   → el-pagination
状态徽标颜色（global.css 的 .status-N）：
  待支付(0)-橙  已支付(1)-绿  已发货(2)-蓝
  已完成(3)-灰  已取消(4)-红
```

### 订单详情（OrderDetail.vue）

```
PageHeader 带返回按钮
详情卡片 → 顶部状态徽标 + 订单号；2列网格（600px 以下 1 列）：
  订单号 / 下单时间 / 订单金额 / 支付时间
  收货人 / 联系电话 / 收货地址 / 备注
  后端一同返回订单明细列表（orderItems），后续可展示购买的商品清单
待支付状态显示"立即支付"按钮
已发货状态显示"确认收货"按钮
订单不存在 → EmptyState
```

### 支付结果（PaymentResult.vue）

```
支付宝付款完成 → 浏览器回跳到本页面（?orderNo=xxx）
→ getPaymentByOrderNo()（后端按需向支付宝同步）→ 每 3 秒顺序查询、不重叠，最多 20 次
→ 支付状态为 1 后改用 getOrderByNo() 核对订单状态；paymentConfirmed 后不再重复查支付
→ 展示：
    成功(绿色图标)   → 订单已支付 / 已发货 / 已完成
    处理中(橙色图标) → 支付处理中，或"支付已确认，订单同步中"
    失败(红色图标)   → 缺少订单号 / 交易已关闭 / exception（已付款但订单已取消，需人工退款）/ unconfirmed（达到查询上限仍未确认）
→ 按钮：我的订单（或查看订单）/ 返回首页
```

### 个人中心（UserInfo.vue）

```
头像   → 圆形展示(112px)，hover 显示"更换头像"遮罩
        点击 → 选图片文件 → AvatarCropper 裁剪弹窗
        裁剪确认 → uploadAvatar() 上传 MinIO → updateUserInfo({avatar}) 保存
信息卡片 → iOS 设置风格分组列表：用户名(只读) + 昵称/手机/邮箱(可编辑)；昵称与角色标签显示在头像下方
动作按钮 → 编辑资料(切换输入框/文本) | 申请成为卖家(仅BUYER可见)
保存 → updateUserInfo() → fetchUserInfo() 刷新
```

### 收货地址（Address.vue）

```
地址卡片网格(2列，640px 以下 1 列) → 收货人 + 电话 + 地址 + 默认标签（默认地址卡片带蓝色描边）
操作 → 添加(弹窗表单) | 编辑 | 删除(确认)
表单 → 收货人 + 电话 + 省/市/区(el-cascader 三级联动) + 详细地址 + 默认开关
       省市区数据来源于 src/data/regions.json，选择后自动填入 form.province/city/district
```

### 商品管理（ProductManage.vue）

```
表格 → ID | 缩略图 | 名称 | 价格 | 库存 | 销量 | 状态标签
操作 → 添加(链接到表单) | 编辑 | 删除(确认)
状态 → 上架(success 绿) / 下架(info 灰) / 审核中(warning 橙)
自动刷新 → 每 30s 静默拉取最新商品状态（无需手动刷新即可看到审核结果）
分页     → 后端返回真实 total，分页器可正确显示总页数
```

### 商品表单（ProductForm.vue）

```
表单字段 → 名称 | 分类(tree-select) | 价格 | 库存 | 描述(textarea)
         主图上传(点击上传区域 → 选图片文件 → uploadImage() 上传 MinIO → 返回 URL 填入表单
                  + 实时预览 200×150 + URL 输入框(可手动修改) + 删除按钮)
        状态(仅ADMIN可见)
提交 → addProduct() 或 updateProduct()
路由复用于添加(/add)和编辑(/:id/edit)
```

### 分类管理（CategoryManage.vue）

```
树形表格 → 名称(缩进显示层级) | 排序 | 操作
操作 → 添加(选父分类 + 名称 + 排序) | 编辑 | 删除(有子分类不可删)
```

### 用户管理（UserList.vue）

```
两栏布局：
  上：卖家申请审批 → 表格(申请ID | 用户ID | 状态 | 通过/拒绝按钮)，无申请时不显示表格
  下：用户列表 → 表格(ID | 用户名 | 昵称 | 角色 | 手机 | 邮箱 | 操作)
               重置密码(弹窗输入新密码)
```

### 商品审核（ProductReview.vue）

```
表格 → ID | 缩略图 | 名称 | 价格 | 库存 | 卖家ID | 通过/拒绝按钮
操作后 → 审批后立即从列表移除（乐观更新）
自动刷新 → 每 30s 静默拉取新待审商品（无需手动刷新）
```

### 卖家订单管理（SellerOrderManage.vue）

```
卡片列表 → 每张卡片：订单号 + 状态徽标 + 下单时间
         商品明细行：缩略图 + 名称 + 单价×数量 + 小计
         底部：收货人信息 + 合计金额
         已支付订单显示"发货"按钮 → 确认后 status 改为已发货
分页 → el-pagination
```

### 失败消息（OutboxManage.vue）

```
PageHeader → 标题"失败消息" + 共 N 条 + 刷新按钮
表格 → 消息ID | Topic | 消息键 | 状态 | 重试次数 | 失败时间 | 操作(重新发送)
数据 → getFailedOutboxMessages(50)；重新发送 → retryFailedOutboxMessage(id)（仅 ADMIN）
```

### 错误页（403 / 404 / 500）

```
独立全屏页面（不在 MainLayout 内）：大号渐变状态码 + 标题 + 说明 + 返回首页 / 返回上一页（500 为刷新页面）
样式来自 assets/error-page.css
```

### 头像裁剪（AvatarCropper.vue）

```
触发 → 用户选择图片文件后渲染（Teleport 到 body 全屏遮罩）
布局 → 裁剪视口(320px高) + 缩放滑块(50%-300%) + 确认/取消按钮
交互 → 鼠标/触摸拖拽图片移动定位，下方滑块缩放
     圆形蒙版(box-shadow 实现镂空) + 白色圆圈指示裁剪区域
裁剪 → Canvas drawImage（根据偏移/缩放计算源矩形）
     → canvas.toBlob('image/jpeg', 0.85) 输出 300×300 JPEG
     → emit('cropped', blob) 通知父组件上传
```

---

## 共享模块

### orderStatus.js（`constants/orderStatus.js`）

被 OrderList、OrderDetail、SellerOrderManage 三个页面引用：

```js
export const ORDER_STATUS_MAP = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 4: '已取消' }
export function orderStatusText(status) { ... }  // 根据 code 返回中文文本
export const ORDER_STATUS = { UNPAID: 0, PAID: 1, SHIPPED: 2, COMPLETED: 3, CANCELLED: 4 }
```

### usePayment.js（`composables/usePayment.js`）

被 OrderList、OrderDetail 两个页面引用，封装支付宝支付流程：

```js
function handlePay(orderNo)
  // Step 1: 先同步 window.open 打开空窗口（在用户点击上下文中，避免浏览器拦截弹窗）
  // Step 2: ElMessageBox.confirm 确认支付
  // Step 3: 确认 → createAlipayPayment(orderNo) 获取支付表单 HTML
  //         → 校验支付表单（HTTPS + 支付宝域名白名单 + 必填字段）后在已打开窗口写入并 submit()，不使用 document.write
  // Step 4: 取消或失败 → w.close() 关闭窗口
isPaying(orderNo)
  // 该订单从点击支付到支付窗口关闭期间都返回 true（按订单加锁，30 分钟超时自动释放）
  // 因此支付宝窗口打开期间，订单列表按钮也会显示"正在准备…"并禁用
```

支付表单只允许提交到 `openapi.alipay.com` 或 `openapi-sandbox.dl.alipaydev.com` 的 `/gateway.do`，且必须是 POST。

### useCheckoutRequest.js（`composables/useCheckoutRequest.js`）

被 Cart 页面引用，保证同一次结算不会重复下单，并且失败后可以恢复：

```js
const checkout = useCheckoutRequest(userStore, async orderId => { /* 跳转订单详情 */ })
// 返回 { pending, status, message, busy, locked, initialize, prepare, submit, refresh }
```

- **令牌**：`prepare()` 通过 `GET /api/orders/token` 获取或复用下单令牌。提交前先把令牌和原提交参数（地址、备注）写入 `sessionStorage['cloud-checkout:<userId>']`，再调用 `POST /api/orders`。
- **状态**：READY / PROCESSING / SUCCEEDED / FAILED / EXPIRED / UNKNOWN。
  - PROCESSING、COMPENSATING、UNKNOWN（超时或网络中断）→ 只用 `GET /api/orders/requests/{token}` 查询原请求，每 2 秒一次，最多 20 次，不会换令牌重新下单。
  - 业务码 42201 → 回到 READY，保留同一令牌，可修正地址或备注后重试。
  - SUCCEEDED → 清除记录并以订单 id 调用第二个参数（成功回调）；FAILED / EXPIRED → 清除记录，下次结算时获取新令牌。
- **安全处理**：每次处理结果前确认用户没有切换、页面没有卸载；`sessionStorage` 记录格式不合法时 `initialize()` 抛错，Cart 页面提示错误，结算按钮保持禁用，不会丢弃记录，也不会换令牌下单。
- **页面恢复**：刷新或重新进入购物车时，`initialize()` 读取记录并刷新请求状态；如果仍处于锁定状态，由 Cart 页面带回原地址和备注、重新打开结算弹窗，并跳过"立即购买"的自动勾选。

### usePolling.js（`composables/usePolling.js`）

被 ProductManage、SellerOrderManage、ProductReview、OrderList 四个页面引用（OrderList 使用 15s），封装轮询逻辑：

```js
export function usePolling(pollFn, { interval = 30000 })
  // onMounted: 启动 setTimeout 链（上一次轮询完成后才安排下一次）
  // visibilitychange: 页面隐藏时 clearTimeout，恢复时立即执行 pollFn 并重新计时
  // onBeforeUnmount: 清理计时器和事件监听
  // 返回 { start, stop } 供手动控制
```

### usePagination.js（`composables/usePagination.js`）

通用分页 composable（目前没有页面引用，各列表页自行实现分页）：

```js
export function usePagination(fetchFn, { defaultSize = 10, immediate = true })
  // 返回: { page, size, total, list, loading, fetchData, onPageChange, reset }
```

---

## 近期更新（2026-09）

| 类别 | 变更 | 涉及文件 |
|------|------|----------|
| 下单请求恢复 | 新增 `useCheckoutRequest`：令牌与原参数先落 sessionStorage，结果未知时只查询原请求，明确失败才换令牌 | `composables/useCheckoutRequest.js`、`views/cart/Cart.vue`、`api/order.js`、`utils/request.js` |
| 视觉重设计 | Apple 风格设计令牌与公共类，Element Plus 覆盖改为 `html` 前缀，清理旧配色与失效样式，错误页样式合并 | `assets/*.css`、全部组件与页面的 `<style>` |
| 测试 | 新增下单请求恢复与支付结果页的 Node 测试 | `tests/*.test.mjs` |

## 近期更新（2026-06-04）

### 架构增强

| 类别 | 变更 | 涉及文件 |
|------|------|----------|
| 命令式服务 CSS | 显式导入 MessageBox / Message / Notification CSS，修复按需加载遗漏 | `main.js` |
| 弹窗防拦截 | 支付弹窗改为先同步 `window.open` 再异步加载表单 | `composables/usePayment.js` |
| 通用轮询 | 提取 3 个管理页面的重复轮询逻辑为 `usePolling` composable | `composables/usePolling.js`、3 个管理页面 |
| 购物车防抖 | 每个商品独立 Map<id, timer> 计时器，避免多商品互锁永久禁用 | `views/cart/Cart.vue` |
| 乐观更新 | cart store 的 updateQty / toggleCheck / checkAll / remove 改为乐观更新 + 失败回滚 | `stores/cart.js` |
| 购物车批量 | 新增 `checkAllItems` API + cart store `checkAll` / `reset` 方法 | `api/cart.js`、`stores/cart.js` |

### Bug 修复

| 问题 | 修复 |
|------|------|
| 登出 MessageBox 被挤到左下角 | `main.js` 显式导入 Element Plus 命令式服务 CSS |
| 支付结果无限轮询 | 添加最大轮询次数限制（20 次 = 60 秒），超时显示错误 |
| 立即购买失败仍跳转购物车 | `sessionStorage` 标记仅在 `cartStore.add()` 成功后写入 |
| ProductList 搜索路由复用不刷新 | 新增 `watch(route.query.keyword)` 监听路由变化 |
| 登出直接赋值 `cartStore.items = []` | 新增 `cartStore.reset()` 方法 |
| `imgError` ref 死代码 | 从 ProductForm.vue 移除 |
| OrderList import 语句位置 | 移至所有 import 声明之后 |

### UI/UX 改进

| 改进 | 涉及页面 |
|------|----------|
| Home 页面 API 失败显示错误状态 + 重试按钮 | `views/Home.vue` |
| 地址保存/删除按钮添加 loading 状态 | `views/user/Address.vue` |
| 用户信息保存按钮添加 loading + disabled 状态 | `views/user/UserInfo.vue` |
| 订单状态新增 `ORDER_STATUS` 命名常量 | `constants/orderStatus.js` |

---

## 2026-07 Reliability Update

### Frontend state behavior

- **Authentication:** every API `401` clears local token, Pinia user state, and cart state before redirecting to `/login`. A failed profile request only logs the user out for an actual authentication failure; network and server failures are surfaced to the caller instead of being reported as a successful login.
- **Cart quantity:** each product uses its own debounced update. The UI keeps the last server-confirmed quantity as the rollback value, and pending changes are submitted when the cart page is left.
- **Order and product lists:** initial-load failures show a retry state instead of an empty list. Background order refreshes run every 15 seconds without full-page loading flicker, stale responses are ignored, and polling pauses while the page is hidden.
- **Payment result:** `/payment/result?orderNo=...` performs sequential checks at a three-second interval, for at most 20 checks. It never overlaps requests, shows `success` for payment status `1`, shows a closed-transaction result for status `2`, and otherwise directs the user to the order list after timeout.

### UI and responsive behavior

- Global product search is available before login.
- Below `768px`, the sidebar is hidden so the content area remains usable; the compact header keeps search, cart, and account access available.
- Product cards use a stable image aspect ratio and support keyboard activation with `Enter` and `Space`.
- The checkout dialog uses `min(560px, calc(100vw - 32px))` and no longer relies on absolute centering overrides.

### Local verification

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 输出到 dist/
npm run preview    # 预览构建产物（CloudBack/start-all.bat 最后也会执行它）

# 测试：package.json 没有 test 脚本，需要逐个文件运行
node tests/checkout-request.test.mjs
node tests/payment-result.test.mjs
```

不要用 `node --test tests/`，当前 Node 版本会把目录当作文件而报错。测试通过 `node:vm` 直接执行组件和 composable 源码；`payment-result.test.mjs` 用正则提取 `PaymentResult.vue` 的 `<script setup>` 块，修改该文件时要保留不带属性的 `<script setup>` 标签。

`npm run dev` serves the client on the Vite local URL (normally `http://localhost:5173/`). The development proxy still expects the CloudBack gateway at `/api`; start the backend and its configured middleware before testing login, cart, orders, or payment.

### Payment recovery note

The browser return page is only one confirmation path. If the return is interrupted, do not repeatedly submit the Alipay form. Open the order list or payment-result route again after the payment service has recovered; CloudBack now performs server-side reconciliation for recent pending records as well.

### Clarifications for earlier sections

- `cloud_user` is a local cache only. Startup still verifies the token by fetching `/api/users/me` before treating user information or roles as current.
- `cartStore.fetchCart()` clears items on authentication failure only. It preserves existing cart data for transient network or server failures.
- `usePolling` waits for a poll request to settle before scheduling the next `setTimeout`; it is not a raw `setInterval` loop.
