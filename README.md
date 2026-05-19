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
    │   ├── order.js                     #   订单创建 / 查询 / 取消
    │   └── payment.js                   #   支付记录查询
    │
    ├── stores/                          # Pinia 状态管理
    │   ├── user.js                      #   登录态、用户信息、角色
    │   └── cart.js                      #   购物车列表、勾选统计
    │
    ├── router/
    │   └── index.js                     # 17 条路由 + 登录守卫 + 角色守卫
    │
    ├── layout/
    │   └── MainLayout.vue               # 顶栏 + 侧栏 + 内容 + 底栏 框架
    │
    ├── components/                      # 公共组件
    │   ├── AppHeader.vue                #   顶栏：Logo + 用户下拉菜单 / 登录按钮
    │   ├── AppSidebar.vue               #   侧栏：按角色条件渲染的 el-menu
    │   ├── AppFooter.vue                #   底栏
    │   ├── AvatarCropper.vue            #   头像裁剪：拖拽定位 + 缩放 + Canvas 裁剪输出
    │   ├── EmptyState.vue               #   空数据占位（图标 + 描述 + 按钮）
    │   └── LoadingState.vue             #   加载中占位（旋转动画）
    │
    ├── views/                           # 17 个页面视图
    │   ├── Home.vue                     #   首页：Hero Banner + 热门商品网格
    │   ├── Login.vue                    #   登录页（独立布局）
    │   ├── Register.vue                 #   注册页（独立布局）
    │   ├── error/                       #   403 / 404 / 500 错误页
    │   ├── product/                     #   ProductList、ProductDetail
    │   ├── cart/                        #   Cart（表格 + 结算弹窗）
    │   ├── order/                       #   OrderList、OrderDetail
    │   ├── user/                        #   UserInfo、Address
    │   ├── seller/                      #   ProductManage、ProductForm、CategoryManage
    │   └── admin/                       #   UserList、ProductReview
    │
    ├── assets/
    │   └── global.css                   # CSS 变量、重置、工具类
    │
    └── utils/
        ├── request.js                   # Axios 实例 + 请求/响应拦截器
        └── auth.js                      # localStorage 读写 Token/用户
```

---

## 路由表

17 条路由，`/login` 和 `/register` 为独立全屏页面，其余由 `MainLayout` 包裹。

| 路径 | 页面 | 认证 | 角色限制 | 说明 |
|---|---|---|---|---|
| `/home` | Home.vue | 否 | — | Hero Banner + 热门商品 |
| `/product/list` | ProductList.vue | 否 | — | 搜索框 + 分类下拉 + 分页网格 |
| `/product/:id` | ProductDetail.vue | 否 | — | 商品详情 + 加入购物车 |
| `/login` | Login.vue | 否 | — | 独立布局，按角色跳转 |
| `/register` | Register.vue | 否 | — | 独立布局 |
| `/cart` | Cart.vue | 是 | — | 购物车表格 + 下单弹窗 |
| `/order/list` | OrderList.vue | 是 | — | 订单卡片列表 |
| `/order/:id` | OrderDetail.vue | 是 | — | 订单详情 |
| `/user/info` | UserInfo.vue | 是 | — | 个人信息 + 申请卖家 |
| `/user/address` | Address.vue | 是 | — | 地址 CRUD |
| `/seller/products` | ProductManage.vue | 是 | SELLER, ADMIN | 商品管理表格 |
| `/seller/products/add` | ProductForm.vue | 是 | SELLER, ADMIN | 添加商品 |
| `/seller/products/:id/edit` | ProductForm.vue | 是 | SELLER, ADMIN | 编辑商品（复用表单） |
| `/seller/categories` | CategoryManage.vue | 是 | SELLER, ADMIN | 分类树管理 |
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
    → POST /api/auth/login?username=&password=
    → 响应 token 字符串
    → 存 Pinia ref + localStorage['cloud_token']
  → userStore.fetchUserInfo()
    → GET /api/user/info（带 Authorization 头）
    → 存 Pinia ref + localStorage['cloud_user']
  → cartStore.fetchCart()
    → GET /api/cart/list → 初始化购物车
  → 路由跳转
    → ?redirect 参数存在 → 跳回原页面
    → 否则按角色：
      ADMIN  → /admin/users
      SELLER → /seller/products
      BUYER  → /home
```

### 注册

```text
Register.vue 提交表单
  → userStore.register(username, password, nickname)
    → POST /api/auth/register
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

每个 action 调用对应 API 后重新 `fetchCart()` 同步状态。`clear()` 额外直接清空本地数组（避免多余请求）。

---

## API 层

所有 API 函数返回 Axios Promise，响应格式为 `R<T> = { code, message, data }`。

### auth.js
```js
login(username, password)              // POST /api/auth/login?username&password
register(username, password, nickname) // POST /api/auth/register?username&password&nickname
```

### user.js
```js
getUserInfo()                          // GET /api/user/info
updateUserInfo(params)                 // PUT /api/user/info?nickname&phone&email
getAddressList()                       // GET /api/user/address
addAddress(data)                       // POST /api/user/address
updateAddress(data)                    // PUT /api/user/address
deleteAddress(id)                      // DELETE /api/user/address/:id
getUserList()                          // GET /api/user/admin/list
resetPassword(id, password)            // PUT /api/user/admin/reset-password
applySeller()                          // POST /api/user/apply-seller
getApplications()                      // GET /api/user/admin/applications
processApplication(id, approved)       // PUT /api/user/admin/applications/:id
uploadAvatar(file)                     // POST /api/user/avatar/upload (FormData)
```

### product.js
```js
getCategoryTree()                      // GET /api/product/category
addCategory(data)                      // POST /api/product/category
updateCategory(data)                   // PUT /api/product/category
deleteCategory(id)                     // DELETE /api/product/category/:id
getProductDetail(id)                   // GET /api/product/detail/:id
getProductList({ categoryId, page, size, keyword })  // GET /api/product/list
getHotProducts()                       // GET /api/product/hot
getMyProducts({ page, size })          // GET /api/product/my-list
addProduct(data)                       // POST /api/product
updateProduct(data)                    // PUT /api/product
deleteProduct(id)                      // DELETE /api/product/:id
getPendingProducts({ page, size })     // GET /api/product/admin/pending
reviewProduct(id, approved)            // PUT /api/product/admin/review/:id
uploadImage(file)                      // POST /api/product/upload (FormData)
```

### cart.js
```js
getCartList()                          // GET /api/cart/list
getCheckedItems()                      // GET /api/cart/checked
addToCart(productId, quantity)         // POST /api/cart/add
updateQuantity(productId, quantity)    // PUT /api/cart/quantity
checkItem(productId, checked)          // PUT /api/cart/check
removeFromCart(productId)              // DELETE /api/cart/:productId
clearCart()                            // DELETE /api/cart/clear
```

### order.js
```js
createOrder(addressId, remark)         // POST /api/order/create
getOrderDetail(id)                     // GET /api/order/detail/:id
getOrderList({ page, size })           // GET /api/order/list
cancelOrder(id)                        // PUT /api/order/cancel/:id
```

### payment.js
```js
getPaymentByOrderNo(orderNo)           // GET /api/payment/:orderNo
```

---

## 布局系统

```
┌──────────────────────────────────────────────────────┐
│  AppHeader (56px, sticky)                             │
│  Logo(左)                    头像/角色标签/退出(右)     │
├──────────────┬───────────────────────────────────────┤
│ AppSidebar   │  <router-view>                       │
│ 220px        │  flex: 1, padding: 24px, max-width    │
│ 可收起至64px  │  1200px, 居中                         │
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
- 页面过渡：fade + translateY(8px) 动画
- `AppSidebar`：`activeMenu` 由 `route.path` 的 prefix 匹配决定高亮项
- 侧栏收起时：`AppSidebar.collapsed = true`（64px），菜单仅显示图标

---

## 各页面功能详解

### 首页（Home.vue）

```
Hero Banner → 渐变背景 + "发现好物，品质生活" + 立即选购按钮
热门商品   → getHotProducts() 获取 Top8 → 4列网格卡片
           每张卡片：图片(200px) + 名称(单行省略) + 价格 + 销量
           点击卡片 → /product/:id
状态处理   → LoadingState（加载中）/ EmptyState（无商品）
```

### 商品列表（ProductList.vue）

```
搜索栏 → 搜索框(支持回车搜索 + 一键清空) + 分类下拉(树形展平)
        选分类 → @change → search() → 重置 page=1 → fetchProducts()
商品网格 → 4列，同首页卡片样式
分页   → el-pagination，切换页码 → fetchProducts()
状态   → LoadingState / EmptyState
```

### 商品详情（ProductDetail.vue）

```
左栏 → 商品图片 480×400（el-image + 加载失败占位图标）
右栏 → 名称 + 描述 + 价格(红色大字) + 库存 + 销量
        数量选择器(1-99) + 加入购物车按钮 + 立即购买按钮
加入购物车 → 未登录跳 /login → 已登录 cartStore.add() → ElMessage 成功
立即购买   → 同上 + router.push('/cart')
```

### 购物车（Cart.vue）

```
表格视图 → 表头/每行：勾选框 | 缩略图(72px) | 商品名 | 单价 | 数量(el-input-number) | 小计 | 删除
底栏(全选+清空 | 已选N件 合计¥XX | 去结算按钮)
结算弹窗 → 选择收货地址(select) | 商品清单 | 备注(选填) | 合计金额
         提交 → createOrder(addressId, remark) → 成功 → 跳转订单详情
```

### 订单列表（OrderList.vue）

```
卡片列表 → 每张卡片：订单号 + 状态徽标(颜色区分) + 金额 + 收货人 + 时间
         待支付订单显示"取消订单"按钮
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
顶部状态徽标 + 返回按钮
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
表单 → 收货人 + 电话 + 省/市/区 + 详细地址 + 默认开关
```

### 商品管理（ProductManage.vue）

```
表格 → ID | 缩略图 | 名称 | 价格 | 库存 | 销量 | 状态标签
操作 → 添加(链接到表单) | 编辑 | 删除(确认)
状态 → 上架(green) / 下架(red) / 审核中(orange)
自动刷新 → 每 30s 静默拉取最新商品状态（无需手动刷新即可看到审核结果）
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

## CSS 变量体系（`assets/global.css`）

```css
:root {
  --primary: #5b7cfa;          /* 主题蓝 */
  --primary-light: #eef1ff;    /* 主题浅底 */
  --primary-dark: #4a63d4;     /* 主题深色 */
  --danger: #e8595b;           /* 危险红（价格/删除） */
  --danger-light: #fef0f0;     /* 危险浅底 */
  --success: #52c41a;          /* 成功绿 */
  --warning: #fa9d3f;          /* 警告橙 */
  --text: #1f2937;             /* 主文字 */
  --text-secondary: #6b7280;   /* 次要文字 */
  --text-muted: #9ca3af;       /* 弱化文字 */
  --bg: #f8f9fb;               /* 页面背景 */
  --bg-card: #ffffff;          /* 卡片背景 */
  --border: #eaecf0;           /* 边框 */
  --radius: 8px;               /* 圆角 */
  --radius-lg: 12px;           /* 大圆角 */
}
```

工具类：`.page-container`（padding 24px, max-width 1200px, margin 0 auto）、`.page-title`（20px bold）

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
