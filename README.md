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

## 项目结构

```text
CloudFront/
├── index.html                           # HTML 入口
├── vite.config.js                       # Vite 配置，/api 代理 → localhost:8080
├── package.json
└── src/
    ├── main.js                          # 入口：注册 Vue/Pinia/Router/ElementPlus/图标；显式导入命令式服务 CSS；显式导入命令式服务 CSS
    ├── App.vue                          # 根组件，挂载时恢复登录态
    │
    ├── api/                             # 后端 API 封装（按微服务拆分）
    │   ├── auth.js                      #   登录 / 注册
    │   ├── user.js                      #   个人信息 / 地址 / 管理员接口
    │   ├── product.js                   #   商品 CRUD / 分类 / 热门 / 审核
    │   ├── cart.js                      #   购物车 CRUD
    │   ├── order.js                     #   订单创建 / 查询 / 取消 / 确认收货 / 卖家订单
    │   └── payment.js                   #   支付记录查询
    │
    ├── stores/                          # Pinia 状态管理
    │   ├── user.js                      #   登录态、用户信息、角色
    │   └── cart.js                      #   购物车列表、勾选统计
    │
    ├── router/
    │   └── index.js                     # 19 条路由 + 登录守卫 + 角色守卫
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
    ├── views/                           # 20 个页面视图
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
    │   └── admin/                       #   UserList、ProductReview
    │
    ├── assets/
    │   ├── global.css                   # CSS 变量、重置、工具类、按钮体系、订单状态标签
    │   ├── element-plus.css             # Element Plus 覆盖样式（z-index / MessageBox / Dialog）
    │   └── error-page.css               # 错误页公共样式（403/404/500 共用）
    │
    ├── data/
    │   └── regions.json                 # 中国省市区三级数据（供 el-cascader 使用）
    │
    ├── constants/
    │   └── orderStatus.js               # 订单状态映射 + ORDER_STATUS 命名常量
    │
    ├── composables/
	    │   ├── usePayment.js                # 支付宝支付处理（同步开窗防拦截）
	    │   ├── usePolling.js                # 通用轮询（interval + visibilitychange 自动暂停/恢复）
	    │   └── usePagination.js             # 通用分页逻辑（供列表页使用）
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

19 条路由，`/login` 和 `/register` 为独立全屏页面，其余由 `MainLayout` 包裹。

| 路径 | 页面 | 认证 | 角色限制 | 说明 |
|---|---|---|---|---|
| `/home` | Home.vue | 否 | — | Hero Banner + 热门商品 |
| `/product/list` | ProductList.vue | 否 | — | 搜索框 + 分类下拉 + 分页网格 |
| `/product/:id` | ProductDetail.vue | 否 | — | 商品详情 + 加入购物车 |
| `/login` | Login.vue | 否 | — | 独立布局，登录后统一跳转首页 |
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
| `/403` | 403.vue | 否 | — | 无权限 |
| `/500` | 500.vue | 否 | — | 服务错误 |
| `/:pathMatch(.*)*` | 404.vue | 否 | — | 页面不存在 |

### 路由守卫（`router.beforeEach`）

```text
1. 设置 document.title
2. 若 to.meta.requireAuth && !isLoggedIn()
   → redirect: /login?redirect=<原路径>
3. 若 to.meta.roles 存在
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
  → ElMessageBox.confirm("确定退出?")
  → userStore.logout()      ← 清 token + userInfo
  → cartStore.reset()       ← 清购物车（本地重置，避免 API 401）
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
  code === 401 → 清 token → window.location.href = '/login'
```

### 响应拦截器 — 错误

| HTTP 状态码 | 处理 |
|---|---|
| 401 | 清 token → 硬跳转 `/login` |
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
| `checkedCount` | checked 商品数量总和 |
| `totalPrice` | checked 商品的 `price × quantity` 总和 |

**Actions**：`fetchCart()`、`add()`、`updateQty()`、`toggleCheck()`、`checkAll()`、`remove()`、`clear()`、`reset()`

| Action | 行为 |
|---|---|
| `fetchCart()` | GET /api/cart → 赋值 `items`，失败则清空 |
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
getProductList({ categoryId, page, size, keyword })  // GET /api/products
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
getOrderList({ page, size })           // GET /api/orders
cancelOrder(id)                        // PATCH /api/orders/:id/cancel
receiveOrder(id)                       // PATCH /api/orders/:id/receive
getSellerOrders({ page, size })        // GET /api/seller/orders
shipOrder(id)                          // PATCH /api/seller/orders/:id/ship
getOrderToken()                        // GET /api/orders/token
```

### payment.js
```js
createAlipayPayment(orderNo)             // POST /api/payment/alipay (JSON body: {orderNo})
getPaymentByOrderNo(orderNo)             // GET /api/payment/:orderNo
```

---

## 布局系统

```
┌──────────────────────────────────────────────────────┐
│  AppHeader (58px, sticky)                             │
│  Logo(左)  全局搜索  购物车角标  头像/下拉菜单(右)     │
├──────────────┬───────────────────────────────────────┤
│ AppSidebar   │  <router-view>                       │
│ 230px        │  flex: 1, padding: 28px, max-width    │
│ 可收起至66px  │  1260px, 居中                         │
│              │                                       │
│ el-menu      │  各页面使用 .page-container 工具类      │
│ router 模式   │                                       │
│ 按角色条件    │                                       │
│ 渲染菜单项    │                                       │
├──────────────┴───────────────────────────────────────┤
│  AppFooter (48px)                                    │
│  © 2025 CloudMall - 基于 Spring Cloud Alibaba 微服务  │
└──────────────────────────────────────────────────────┘
```

- `MainLayout.vue`：flex column 全局框架，flex row 分配侧栏+内容
- `AppHeader`：sticky 顶栏，58px 高度，毛玻璃背景（backdrop-filter）
  - Logo 左侧链接到 `/home`
  - 全局搜索栏（仅登录时显示）：输入关键词 → 回车 → router.push 到 `/product/list?keyword=xxx`
  - 购物车图标 + 红色角标（购物车为空时隐藏，>99 显示 99+）
  - 用户头像 + 昵称（过长截断）+ 角色标签（SELLER 蓝色 / ADMIN 红色）
  - 下拉菜单：个人中心 / 收货地址 / 我的订单 / 退出登录
  - 未登录状态：显示"登录"和"注册"按钮
- `AppSidebar`：230px 宽度，可收起至 66px
  - `activeMenu` 由 `route.path` 的 prefix 匹配决定高亮项
  - 菜单分组标签：导航（首页/商品/购物车）、个人（订单/中心/地址）、商家（商品管理/分类管理/订单管理，SELLER/ADMIN 可见）、管理（商品审核/用户管理，仅 ADMIN）
  - 购物车菜单项右侧显示数量角标（max 99+）
  - 底部收起/展开按钮（Fold/Expand 图标切换）
  - 收起时：菜单仅显示图标，分组标签隐藏，角标隐藏
- 页面过渡：`<transition name="page" mode="out-in">`
  - enter: opacity 0→1, translateY(6px)→0
  - leave: opacity 1→0, translateY(0)→(-6px)
  - 持续时间 150ms
- 响应式断点：
  - 1024px：商品网格 4→3 列
  - 768px：商品网格 3→2 列，筛选栏纵向排列，购物车表格隐藏单价/小计列
  - 480px：网格全部变为 1 列，page-container padding 缩小

---

## 各页面功能详解

### 首页（Home.vue）

```
Hero Banner → 渐变背景 + "发现好物，品质生活" + 立即选购按钮
热门商品   → getHotProducts() 获取 Top8 → 4列网格 ProductCard
           每张卡片：图片(210px) + 名称(单行省略) + 价格 + 销量
           右上角"查看全部"链接 → /product/list
           点击卡片 → /product/:id
状态处理   → LoadingState（加载中）/ EmptyState（无商品）
```

### 商品列表（ProductList.vue）

```
搜索栏 → el-autocomplete 搜索框(输入时自动补全商品名，支持回车搜索 + 一键清空)
        + 分类下拉(树形展平)
        排序下拉：默认排序 / 价格从低到高 / 价格从高到低 / 销量优先
        选分类/排序 → @change → search() → 重置 page=1 → fetchProducts()
	        watch route.query.keyword → 已在列表页时搜索自动刷新（路由复用同一组件）
	        watch route.query.keyword → 已在列表页时搜索自动刷新（路由复用同一组件）
商品网格 → 4列，ProductCard 组件
分页   → el-pagination，切换页码：
         初次加载：全屏 LoadingState → 数据就位
         翻页切换：保留当前商品，半透明过渡(300px)，数据返回后平滑替换
状态   → LoadingState（初次空状态）/ EmptyState（筛选无结果 + 清除筛选按钮）
```

### 商品详情（ProductDetail.vue）

```
左栏 → 商品图片 460×420（el-image + 加载失败占位图标）
右栏 → 名称 + 描述
        价格卡片（红色底色）：价格(红色大字 ¥32px) + 库存 + 已售件数
        数量选择器(1-库存上限) + 库存≤10 时显示"仅剩 N 件"红色提示
        操作按钮：加入购物车(描边) + 立即购买(实心蓝)
加入购物车 → 未登录跳 /login → 已登录 cartStore.add() → ElMessage 成功
立即购买   → 同上 + router.push('/cart')
加载失败   → EmptyState "商品不存在" + 返回按钮
响应式     → 900px 以下改为纵向布局，图片宽度 100%
```

### 购物车（Cart.vue）

```
PageHeader → 标题"购物车" + 副标题"管理你的购物清单"
表格视图 → 表头/每行：勾选框 | 缩略图(72px) | 商品名 | 单价 | 数量(el-input-number，独立防抖，避免多商品互锁) | 小计(price×quantity) | 删除
         行 hover 变背景色，缩略图和商品名可点击跳转商品详情
全选     → 顶部勾选框 + 底栏全选复选框，支持半选状态（indeterminate）
         toggleAll → 遍历 items，逐个调用 toggleCheck
粘性底栏 → position: sticky; bottom: 16px; 始终可见
         全选 + 清空购物车 | 已选N件 合计¥XX（红色大字） | 去结算按钮
结算弹窗 → el-dialog（520px, 不可点击遮罩关闭）
         收货地址 select（默认选中默认地址，无地址提示"去添加"）
         商品清单列表（名称 ×数量 + 小计）| 备注(选填)
         合计金额 | 提交订单按钮（有 loading 状态）
         提交 → getOrderToken() → createOrder(addressId, remark, orderToken) → 成功 → 跳转订单详情（或订单列表）
响应式   → 768px 以下隐藏单价/小计列，底栏纵向排列
```

### 订单列表（OrderList.vue）

```
卡片列表 → 每张卡片：订单号 + 状态徽标(颜色区分) + 金额 + 收货人 + 时间
         待支付订单显示"立即支付"和"取消订单"按钮
	         点击"立即支付" → 调 API 获取支付宝表单 → 新窗口打开支付
         已发货订单显示"确认收货"按钮
分页   → el-pagination
状态徽标颜色：
  待支付(0)-orange  已支付(1)-green  已发货(2)-blue
  已完成(3)-gray    已取消(4)-red
```

### 订单详情（OrderDetail.vue）

```
详情卡片 → 2列网格：
  订单号 / 创建时间 / 总金额 / 支付时间
  收货人 / 联系电话 / 收货地址 / 备注
  后端一同返回订单明细列表（orderItems），后续可展示购买的商品清单
待支付状态显示"立即支付"按钮
已发货状态显示"确认收货"按钮 + 返回按钮
```

### 支付结果（PaymentResult.vue）

```
支付宝付款完成 → 同步回跳到本页面（?orderNo=xxx）
→ 调用 getPaymentByOrderNo() → 后端主动查支付宝确认交易状态 → 前端每3秒轮询，最多60秒超时 → 前端每3秒轮询，最多60秒超时
→ 三态展示：
    成功(绿色图标) → "支付成功，将尽快为您发货"
    处理中(橙色图标 最多60秒) → "支付处理中，请勿重复支付"
    失败(红色图标) → 参数错误
→ 按钮：查看我的订单 / 返回首页
```

### 个人中心（UserInfo.vue）

```
头像   → 圆形展示(96px)，hover 显示"更换头像"遮罩
        点击 → 选图片文件 → AvatarCropper 裁剪弹窗
        裁剪确认 → uploadAvatar() 上传 MinIO → updateUserInfo({avatar}) 保存
信息卡片 → 用户名(只读) + 角色标签 + 昵称/手机/邮箱(可编辑)
动作按钮 → 编辑资料(切换输入框/文本) | 申请成为卖家(仅BUYER可见)
保存 → updateUserInfo() → fetchUserInfo() 刷新
```

### 收货地址（Address.vue）

```
地址卡片网格(2列) → 收货人 + 电话 + 地址 + 默认标签
操作 → 添加(弹窗表单) | 编辑 | 删除(确认)
表单 → 收货人 + 电话 + 省/市/区(el-cascader 三级联动) + 详细地址 + 默认开关
       省市区数据来源于 src/data/regions.json，选择后自动填入 form.province/city/district
```

### 商品管理（ProductManage.vue）

```
表格 → ID | 缩略图 | 名称 | 价格 | 库存 | 销量 | 状态标签
操作 → 添加(链接到表单) | 编辑 | 删除(确认)
状态 → 上架(green) / 下架(red) / 审核中(orange)
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
  上：卖家申请审批 → 表格(用户名 | 状态 | 通过/拒绝按钮)
  下：用户列表 → 表格(ID | 用户名 | 昵称 | 角色 | 联系方式)
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

### 头像裁剪（AvatarCropper.vue）

```
触发 → 用户选择图片文件后渲染（Teleport 到 body 全屏遮罩）
布局 → 裁剪视口(320px高) + 缩放滑块(50%-300%) + 确认/取消按钮
交互 → 鼠标/触摸拖拽图片移动定位，下方滑块缩放
     圆形蒙版(box-shadow 实现镂空) + 虚线圆圈指示裁剪区域
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
  //         → w.document.write(payForm) 渲染支付页面
  // Step 4: 取消或失败 → w.close() 关闭窗口
```

### usePolling.js（`composables/usePolling.js`）

被 ProductManage、SellerOrderManage、ProductReview 三个管理页面引用，封装轮询逻辑：

```js
export function usePolling(pollFn, { interval = 30000 })
  // onMounted: 启动 setInterval(pollFn, interval)
  // visibilitychange: 页面隐藏时 clearInterval，恢复时立即执行 pollFn 并重启计时
  // onBeforeUnmount: 清理计时器和事件监听
  // 返回 { start, stop } 供手动控制
```

### usePagination.js（`composables/usePagination.js`）

通用分页 composable，可供任意列表页使用：

```js
export function usePagination(fetchFn, { defaultSize = 10, immediate = true })
  // 返回: { page, size, total, list, loading, fetchData, onPageChange, reset }
```

---

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
npm run dev
npm run build
```

`npm run dev` serves the client on the Vite local URL (normally `http://localhost:5173/`). The development proxy still expects the CloudBack gateway at `/api`; start the backend and its configured middleware before testing login, cart, orders, or payment.

### Payment recovery note

The browser return page is only one confirmation path. If the return is interrupted, do not repeatedly submit the Alipay form. Open the order list or payment-result route again after the payment service has recovered; CloudBack now performs server-side reconciliation for recent pending records as well.

### Clarifications for earlier sections

- `cloud_user` is a local cache only. Startup still verifies the token by fetching `/api/users/me` before treating user information or roles as current.
- `cartStore.fetchCart()` clears items on authentication failure only. It preserves existing cart data for transient network or server failures.
- `usePolling` waits for a poll request to settle before scheduling the next `setTimeout`; it is not a raw `setInterval` loop.
