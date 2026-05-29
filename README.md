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
    ├── main.js                          # 入口：注册 Vue/Pinia/Router/ElementPlus/图标
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
    │   └── index.js                     # 21 条路由 + 登录守卫 + 角色守卫
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
    ├── views/                           # 18 个页面视图
    │   ├── Home.vue                     #   首页：Hero Banner + 热门商品网格
    │   ├── Login.vue                    #   登录页（独立布局）
    │   ├── Register.vue                 #   注册页（独立布局）
    │   ├── error/                       #   403 / 404 / 500 错误页
    │   ├── product/                     #   ProductList、ProductDetail
    │   ├── cart/                        #   Cart（表格 + 结算弹窗）
    │   ├── order/                       #   OrderList、OrderDetail
    │   ├── payment/                     #   PaymentResult
    │   ├── user/                        #   UserInfo、Address、BrowseHistory
    │   ├── seller/                      #   ProductManage、ProductForm、CategoryManage、SellerOrderManage
    │   └── admin/                       #   UserList、ProductReview、AdminDashboard
    │
    ├── assets/
    │   └── global.css                   # CSS 变量、重置、工具类、按钮体系
    │
    ├── data/
    │   └── regions.json                 # 中国省市区三级数据（供 el-cascader 使用）
    │
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

21 条路由，`/login` 和 `/register` 为独立全屏页面，其余由 `MainLayout` 包裹。

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
| `/user/history` | BrowseHistory.vue | 是 | — | 浏览历史（最近 20 条） |
| `/seller/products` | ProductManage.vue | 是 | SELLER, ADMIN | 商品管理表格 |
| `/seller/products/add` | ProductForm.vue | 是 | SELLER, ADMIN | 添加商品 |
| `/seller/products/:id/edit` | ProductForm.vue | 是 | SELLER, ADMIN | 编辑商品（复用表单） |
| `/seller/categories` | CategoryManage.vue | 是 | SELLER, ADMIN | 分类树管理 |
| `/seller/orders` | SellerOrderManage.vue | 是 | SELLER, ADMIN | 卖家订单管理 + 发货 |
| `/admin/dashboard` | AdminDashboard.vue | 是 | ADMIN | 管理看板（用户/商品/订单/交易统计） |
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
   从 localStorage 读用户角色（默认 BUYER）
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
  → cartStore.items = []    ← 清购物车
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
| `totalCount` | checked 商品数量总和 |
| `totalPrice` | checked 商品的 `price × quantity` 总和 |

**Actions**：`fetchCart()`、`add()`、`updateQty()`、`toggleCheck()`、`remove()`、`clear()`

| Action | 行为 |
|---|---|
| `fetchCart()` | GET /api/cart → 赋值 `items`，失败则清空 |
| `add(productId, qty)` | POST /api/cart/items → 自动 `fetchCart()` 同步 |
| `updateQty(id, qty)` | PATCH /api/cart/items/:id → 自动 `fetchCart()` |
| `toggleCheck(id, checked)` | PATCH /api/cart/items/:id/check → 自动 `fetchCart()`，用于全选/取消全选 |
| `remove(productId)` | DELETE /api/cart/items/:id → 自动 `fetchCart()` |
| `clear()` | DELETE /api/cart/items → 同时本地 `items = []`，避免额外请求 |

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
resetPassword(id, newPassword)         // PUT /api/admin/users/:id/password (JSON body)
applySeller()                          // POST /api/users/me/apply-seller
getApplications()                      // GET /api/admin/applications
processApplication(id, approved)       // PATCH /api/admin/applications/:id (JSON body)
uploadAvatar(file)                     // POST /api/users/me/avatar (FormData)
getDashboardStats()                    // GET /api/admin/stats
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
suggestProducts(keyword)               // GET /api/products/suggest
getBrowseHistory()                     // GET /api/products/history
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
```

### order.js
```js
createOrder(addressId, remark)         // POST /api/orders (JSON body: {addressId, remark})
getOrderDetail(id)                     // GET /api/orders/:id
getOrderList({ page, size })           // GET /api/orders
cancelOrder(id)                        // POST /api/orders/:id/cancel
receiveOrder(id)                       // POST /api/orders/:id/confirm-receive
getSellerOrders({ page, size })        // GET /api/seller/orders
shipOrder(id)                          // PUT /api/seller/orders/:id/ship
```

### payment.js
```js
createAlipayPayment(orderNo)             // POST /api/payment/pay (JSON body: {orderNo, method})
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
  - 菜单分组标签：导航（首页/商品/购物车）、个人（订单/中心/地址/浏览历史）、商家（商品管理/分类管理/订单管理，SELLER/ADMIN 可见）、管理（管理看板/商品审核/用户管理，仅 ADMIN）
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
表格视图 → 表头/每行：勾选框 | 缩略图(72px) | 商品名 | 单价 | 数量(el-input-number) | 小计(price×quantity) | 删除
         行 hover 变背景色，缩略图和商品名可点击跳转商品详情
全选     → 顶部勾选框 + 底栏全选复选框，支持半选状态（indeterminate）
         toggleAll → 遍历 items，逐个调用 toggleCheck
粘性底栏 → position: sticky; bottom: 16px; 始终可见
         全选 + 清空购物车 | 已选N件 合计¥XX（红色大字） | 去结算按钮
结算弹窗 → el-dialog（520px, 不可点击遮罩关闭）
         收货地址 select（默认选中默认地址，无地址提示"去添加"）
         商品清单列表（名称 ×数量 + 小计）| 备注(选填)
         合计金额 | 提交订单按钮（有 loading 状态）
         提交 → createOrder(addressId, remark) → 成功 → 跳转订单详情（或订单列表）
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
→ 调用 getPaymentByOrderNo() → 后端主动查支付宝确认交易状态
→ 三态展示：
    成功(绿色图标) → "支付成功，将尽快为您发货"
    处理中(橙色图标) → "支付处理中，请勿重复支付"
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

### 管理看板（AdminDashboard.vue）

```
6 张统计卡片（3列网格）：
  用户总数(蓝) | 卖家数量(绿) | 上架商品(黄)
  订单总数(紫) | 交易总额(红,高亮) | 待支付订单(橙)
数据来源 → GET /api/admin/stats → 后端聚合 user/order/product 三服务数据
响应式 → 768px 以下改为 2 列
```

### 浏览历史（BrowseHistory.vue）

```
商品网格(4列) → 最近浏览的 20 个商品，复用 ProductCard 组件
数据来源 → GET /api/products/history → 后端从 Redis List 读取
无记录 → EmptyState "暂无浏览记录" + "去逛逛"按钮
浏览记录写入时机 → 商品详情页访问时，后端自动记录到 Redis List（仅登录用户）
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

## 公共组件

### ProductCard（`components/ProductCard.vue`）

接收 `product` prop，用于首页热门商品网格和商品列表：

```
┌────────────────────────────┐
│  商品主图 (el-image, cover)  │ ← 210px 高，加载失败显示图标占位
│  card-actions 插槽区域       │ ← hover 时从底部渐变淡入
├────────────────────────────┤
│  商品名称(单行省略)          │
│  ¥价格(红色大字)    已售 N件  │
└────────────────────────────┘
```

- hover 动画：卡片上移 4px + 边框变蓝 + 阴影放大 + 图片 scale(1.05)
- `card-actions` slot：可插入操作按钮，点击不冒泡

### PageHeader（`components/PageHeader.vue`）

用于购物车、订单列表等页面的标题栏：

```js
props: {
  title: String (必填),           // 主标题
  subtitle: String (可选),        // 副标题，灰色小字
  showBack: Boolean (默认 false), // 显示返回按钮
  backTo: String | Object (可选)   // 返回路径，不传则 router.back()
}
# actions slot：右侧操作区域
```

---

## CSS 变量体系（`assets/global.css`）

### Design Tokens

```css
:root {
  /* 品牌色 */
  --primary: #4f6ef5;            /* 主题蓝 */
  --primary-light: #eff2ff;      /* 主题浅底 */
  --primary-dark: #3b54d4;       /* 主题深色 */
  --primary-gradient: linear-gradient(135deg, #4f6ef5, #6c5ce7);

  /* 语义色 */
  --danger: #e8595b;             /* 危险红（价格/删除） */
  --danger-light: #fef2f2;       /* 危险浅底 */
  --danger-dark: #d94a4c;
  --success: #22c55e;            /* 成功绿 */
  --success-light: #f0fdf6;
  --warning: #f59e0b;            /* 警告橙 */
  --warning-light: #fffbeb;

  /* 文字 */
  --text: #1a1a2e;               /* 主文字 */
  --text-secondary: #5a5a7a;     /* 次要文字 */
  --text-muted: #9c9cb8;         /* 弱化文字 */

  /* 背景 */
  --bg: #f5f6fa;                 /* 页面背景 */
  --bg-card: #ffffff;            /* 卡片背景 */
  --bg-hover: #f8f9fc;           /* hover 背景 */

  /* 边框 / 阴影 */
  --border: #e8e8f0;
  --border-light: #f0f0f5;
  --shadow-xs / --shadow-sm / --shadow / --shadow-md / --shadow-lg

  /* 圆角 */
  --radius-sm: 6px; --radius: 10px; --radius-lg: 14px;
  --radius-xl: 20px; --radius-full: 9999px;

  /* 过渡 */
  --transition-fast: .15s ease;
  --transition: .2s ease;
  --transition-slow: .3s cubic-bezier(.4,0,.2,1);
}
```

### 工具类

| 类名 | 用途 |
|---|---|
| `.page-container` | padding 28px 32px, max-width 1260px, margin 0 auto |
| `.page-title` | 20px bold, letter-spacing -.3px |
| `.card` | 白色背景 + 边框 + 圆角，hover 变蓝色边框 + 阴影 |
| `.btn` / `.btn-primary` / `.btn-danger` / `.btn-ghost` / `.btn-outline-danger` | 按钮体系 |
| `.btn-sm` / `.btn-lg` | 按钮尺寸变体 |
| `.badge` | 圆角胶囊标签 |
| `.text-muted` / `.text-secondary` / `.text-danger` / `.text-primary` / `.text-success` | 文字颜色 |
| `.truncate` | 单行省略（overflow + text-overflow + nowrap） |
| `.grid-2` / `.grid-3` / `.grid-4` | 响应式网格（自动适配断点） |
| `.mt-1`~`.mt-3` / `.mb-1`~`.mb-3` | 间距工具类 |

---

## 快速开始

```bash
npm install
npm run dev       # http://localhost:5173, /api → localhost:8080
npm run build     # 生产构建 → dist/
```

确保后端 7 个服务已在虚拟机启动，Gateway 8080 可访问。

---

## 常见问题

| 现象 | 原因 | 解决 |
|---|---|---|
| API 500 | 对应后端服务未启动或 Nacos 注册失败 | 检查 Nacos 服务列表，确认所有服务健康 |
| 页面空白/路由不跳转 | 后端返回非 JSON 格式 | 检查 Vite 代理配置，确认 Gateway 端口正确 |
| 图片加载失败 | 图片 URL 不可用或 MinIO 未启动 | 确认 MinIO 容器运行中，Bucket 已创建并有公开读策略 |
| 头像/商品图上传失败 | MinIO 容器未启动或网络不通 | `docker compose up -d minio`，检查 9000 端口 |
| 裁剪后头像模糊 | Canvas 输出尺寸不够 | 已固定 300×300，质量 0.85 |
| 审核/管理页状态不更新 | 之前需要手动刷新 | 已添加 30s 静默轮询，自动拉取最新状态 |
| 改角色后菜单没变 | JWT 中 role 仍是旧值 | 退出重新登录获取新 JWT |
| 下单后购物车没清空 | 后端 Feign 调用 cart/clear 失败 | 检查 cloud-cart 服务是否启动 |
| 下拉框选分类无反应 | 前端未绑定 change 事件 | 确认 @change="search" 已添加 |
| 选父分类查不到商品 | 之前只精确匹配分类 ID | 后端已改为递归收集子分类 ID |
| 订单显示待支付但支付宝已扣款 | 异步通知无法到达本地 | 查询支付记录时后端主动查支付宝确认状态 |
| 支付后跳转"localhost拒绝连接" | 前端端口不是默认5173，或未启动 | 确认 Vite preview/build 端口，更新 ALIPAY_RETURN_URL |
| 点击支付后弹出支付宝错误页 | return_url 格式被支付宝拒绝 | 使用前端直连地址而非网关地址 |
| 裁剪头像周围有黑框 | Canvas 未裁剪为圆形且 JPEG 不支持透明 | 已修复：白色填充 + 圆形 clip 路径 + clamp 边界 |
| 裁剪头像位置偏上 | 计算未考虑 object-fit:contain 留白 | 已修复：正确映射 CSS 盒模型→源图像素坐标 |
| 顶栏不显示头像 | 未上传过头像 | 上传后 el-avatar :src 绑定 avatar URL，无头像回退图标 |
