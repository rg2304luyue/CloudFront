# CloudFront 电商前端

Vue 3 + Vite + Element Plus + Pinia + Vue Router，配合 CloudBack 微服务后端。

## 技术栈

|层级|技术|版本|
|---|---|---|
|框架|Vue|3.5|
|构建|Vite|6.x|
|UI|Element Plus|2.9|
|路由|Vue Router|4.5|
|状态管理|Pinia|2.3|
|HTTP|Axios|1.7|
|图标|@element-plus/icons-vue|2.3|

## 项目结构

```text
CloudFront/
├── index.html
├── vite.config.js                  # API 代理 → localhost:8080
├── package.json
└── src/
    ├── main.js                     # 入口：插件注册、中文语言包
    ├── App.vue                     # 根组件
    │
    ├── api/                        # API 层（按后端服务拆分）
    │   ├── auth.js                 #   登录/注册
    │   ├── user.js                 #   用户 + 管理员接口
    │   ├── product.js              #   商品 CRUD + 审核
    │   ├── cart.js                 #   购物车
    │   ├── order.js                #   订单
    │   └── payment.js              #   支付
    │
    ├── stores/                     # Pinia
    │   ├── user.js                 #   用户（登录态、角色、权限）
    │   └── cart.js                 #   购物车（总数、总价）
    │
    ├── router/
    │   └── index.js                # 路由 + 登录守卫 + 角色守卫
    │
    ├── layout/
    │   └── MainLayout.vue          # 主布局框架
    │
    ├── components/                 # 公共组件
    │   ├── AppHeader.vue           #   顶栏：Logo + 角色标签 + 头像/登录
    │   ├── AppSidebar.vue          #   侧栏：按角色显示菜单
    │   ├── AppFooter.vue           #   底栏
    │   ├── EmptyState.vue          #   空数据
    │   └── LoadingState.vue        #   加载中
    │
    ├── views/                      # 页面
    │   ├── Home.vue                #   首页（Banner + 热门商品）
    │   ├── Login.vue               #   登录 → 按角色跳转
    │   ├── Register.vue            #   注册
    │   ├── error/                  #   403 / 404 / 500
    │   ├── product/                #   商品列表、商品详情
    │   ├── cart/                   #   购物车
    │   ├── order/                  #   订单列表、订单详情
    │   ├── user/                   #   个人中心、收货地址
    │   ├── seller/                 #   商品管理、商品表单、分类管理
    │   └── admin/                  #   商品审核、用户管理
    │
    ├── assets/
    │   ├── global.css              #   全局样式
    │   └── images/                 #   图片资源
    │
    ├── utils/
    │   ├── request.js              #   Axios 封装（拦截器 + Token）
    │   └── auth.js                 #   Token/用户缓存读写
    │
    └── data/                       # 静态数据
```

## 页面路由

|路径|页面|权限|说明|
|---|---|---|---|
|`/home`|首页|公开|Banner + 热门商品|
|`/product/list`|商品列表|公开|搜索、分类、分页|
|`/product/:id`|商品详情|公开||
|`/login`|登录|公开|独立全屏，按角色跳转|
|`/register`|注册|公开||
|`/cart`|购物车|需登录|勾选、改数量、结算|
|`/order/list`|我的订单|需登录||
|`/order/:id`|订单详情|需登录||
|`/user/info`|个人中心|需登录|编辑信息、申请成为卖家|
|`/user/address`|收货地址|需登录|CRUD|
|`/seller/products`|商品管理|SELLER / ADMIN|增删改、审核状态|
|`/seller/products/add`|添加商品|SELLER / ADMIN|表单 + 图片预览|
|`/seller/products/:id/edit`|编辑商品|SELLER / ADMIN||
|`/seller/categories`|分类管理|SELLER / ADMIN|树形 CRUD|
|`/admin/review`|商品审核|ADMIN|通过/拒绝待审核商品|
|`/admin/users`|用户管理|ADMIN|列表 + 重置密码 + 卖家申请审批|

**路由守卫逻辑**：

1. `meta.requireAuth` → 未登录跳 `/login`
2. `meta.roles` → 角色不匹配跳 `/403`
3. 登录成功后按角色跳转：ADMIN → `/admin/users`，SELLER → `/seller/products`，BUYER → `/home`

## 角色体系

三种角色，`userStore` 提供 computed 属性：

|属性|来源|值|
|---|---|---|
|`isLogin`|token 是否存在|boolean|
|`role`|userInfo.role|'BUYER' / 'SELLER' / 'ADMIN'|
|`isSeller`|role === 'SELLER'|boolean|
|`isAdmin`|role === 'ADMIN'|boolean|
|`roleLabel`|角色中文名|'买家' / '卖家' / '管理员'|

侧栏（AppSidebar）根据 `isSeller` / `isAdmin` 条件渲染菜单项，顶栏（AppHeader）在用户名旁显示角色标签。

## 布局

```text
┌──────────────────────────────────────┐
│  AppHeader（Logo + 角色标签 + 头像）  │
├────────┬─────────────────────────────┤
│AppSidebar│                          │
│  按角色  │     <router-view>        │
│  条件渲染│     各页面自主控制布局    │
├────────┴─────────────────────────────┤
│  AppFooter                          │
└──────────────────────────────────────┘
```

## 快速开始

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # 生产构建 → dist/
```

Vite 自动将 `/api` 代理到 `http://localhost:8080`（后端 Gateway）。

后端需要先启动且 `.env` 中 `VM_HOST` 配置正确。

## 常见问题

|现象|解决|
|---|---|
|API 500 Internal Server Error|检查对应后端服务是否启动，Nacos 服务列表是否健康|
|图片预览不显示|确认填写的是图片直链（如 https://.../xxx.jpg）而非网页链接|
|改角色后菜单没变|退出重新登录获取新 JWT|
|ID 显示不全/审批失败|后端已配置 Jackson Long→String，确保前后端均更新|
