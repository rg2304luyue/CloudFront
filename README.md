# CloudFront 电商前端

基于 Vue 3 + Vite + Element Plus 构建的电商前端，配合 CloudBack 微服务后端使用。

## 技术栈

|层级|技术|版本|
|---|---|---|
|框架|Vue|3.5|
|构建|Vite|6.x|
|UI 组件库|Element Plus|2.9|
|路由|Vue Router|4.5|
|状态管理|Pinia|2.3|
|HTTP 请求|Axios|1.7|
|图标|@element-plus/icons-vue|2.3|

## 项目结构

```text
CloudFront/
├── index.html                      # 入口 HTML
├── package.json                    # 依赖声明
├── vite.config.js                  # Vite 配置（含 API 代理）
└── src/
    ├── main.js                     # 入口：注册插件、中文语言包
    ├── App.vue                     # 根组件
    │
    ├── api/                        # API 请求层（按后端服务拆分）
    │   ├── auth.js                 #   认证：登录/注册
    │   ├── user.js                 #   用户：信息/地址
    │   ├── product.js              #   商品：CRUD/分类
    │   ├── cart.js                 #   购物车：增删改查/勾选
    │   ├── order.js                #   订单：创建/查询/取消
    │   └── payment.js              #   支付：查询
    │
    ├── utils/                      # 工具函数
    │   ├── request.js              #   Axios 封装：拦截器、错误处理
    │   └── auth.js                 #   Token 存取、登录状态
    │
    ├── stores/                     # Pinia 状态管理
    │   ├── user.js                 #   用户状态：登录/注册/信息
    │   └── cart.js                 #   购物车状态：列表/总数/总价
    │
    ├── router/
    │   └── index.js                # 路由配置 + 按需登录守卫
    │
    ├── layout/
    │   └── MainLayout.vue          # 主布局：顶栏 + 侧边栏 + 内容 + 底栏
    │
    ├── components/                 # 通用组件
    │   ├── AppHeader.vue           #   公共页头（Logo + 头像/登录入口）
    │   ├── AppSidebar.vue          #   公共侧边导航栏（可折叠）
    │   ├── AppFooter.vue           #   公共页脚
    │   ├── EmptyState.vue          #   空数据组件
    │   └── LoadingState.vue        #   加载中组件
    │
    ├── views/                      # 页面
    │   ├── Home.vue                #   首页（Banner + 热门商品）
    │   ├── Login.vue               #   登录页
    │   ├── Register.vue            #   注册页
    │   ├── error/
    │   │   ├── 404.vue             #   页面未找到
    │   │   ├── 403.vue             #   禁止访问
    │   │   └── 500.vue             #   服务内部错误
    │   ├── product/
    │   │   ├── ProductList.vue     #   商品列表（搜索/分类/分页）
    │   │   └── ProductDetail.vue   #   商品详情（加购/购买）
    │   ├── cart/
    │   │   └── Cart.vue            #   购物车（勾选/数量/结算）
    │   ├── order/
    │   │   ├── OrderList.vue       #   订单列表
    │   │   └── OrderDetail.vue     #   订单详情
    │   └── user/
    │       ├── UserInfo.vue        #   个人中心
    │       └── Address.vue         #   收货地址（CRUD + 默认）
    │
    ├── assets/
    │   ├── global.css              #   全局样式
    │   └── images/                 #   图片资源目录
    │
    └── data/                       # 静态数据 / Mock 数据目录
```

## 页面路由

|路径|页面|权限|说明|
|---|---|---|---|
|`/home`|首页|公开|Banner + 热门商品|
|`/product/list`|商品列表|公开|搜索、分类筛选、分页|
|`/product/:id`|商品详情|公开|加购、立即购买|
|`/login`|登录|公开|独立全屏页面|
|`/register`|注册|公开|独立全屏页面|
|`/cart`|购物车|需登录|勾选、改数量、结算|
|`/order/list`|我的订单|需登录|取消订单|
|`/order/:id`|订单详情|需登录|订单信息|
|`/user/info`|个人中心|需登录|编辑信息|
|`/user/address`|收货地址|需登录|CRUD|
|`/403`|禁止访问|公开|无权限时显示|
|`/500`|服务错误|公开|服务器异常时显示|
|`/*`|404|公开|未匹配路由|

> 路由守卫按 `meta.requireAuth` 标记进行登录校验，公开页面可直接访问无需登录。

## 布局结构

```text
┌──────────────────────────────────────┐
│  AppHeader（Logo + 头像/登录入口）    │
├────────┬─────────────────────────────┤
│AppSidebar│                          │
│  可折叠  │     <router-view>        │
│  垂直菜单 │     各页面自主控制布局    │
├────────┴─────────────────────────────┤
│  AppFooter                          │
└──────────────────────────────────────┘
```

进入网站直接展示商城主页，无需登录。右上角提供头像入口：

- **未登录**：显示用户图标 + "点击登录"，点击跳转登录页
- **已登录**：显示头像 + 用户名，下拉菜单可进入个人中心、收货地址或退出

## 架构分层

```text
Views（页面）
  │ 使用 stores 获取状态，调用 api 发送请求
  ▼
Stores（Pinia 状态管理）
  │ 调用 api 层，管理响应式数据
  ▼
API 层（按服务拆分）
  │ 调用 utils/request.js
  ▼
request.js（Axios 封装）
  │ 请求拦截：自动带 Token
  │ 响应拦截：统一错误处理（401→跳登录，403/500→提示）
  ▼
CloudBack Gateway :8080 → 后端微服务集群
```

## 快速开始

### 环境要求

- Node.js >= 18
- CloudBack 后端已启动（Gateway 监听 8080 端口）

### 安装依赖

```bash
cd CloudFront
npm install
```

### 开发模式

```bash
npm run dev
# 打开 http://localhost:5173
```

Vite 开发服务器自动将 `/api` 请求代理到 `http://localhost:8080`（后端 Gateway）。

### 生产构建

```bash
npm run build
# 输出到 dist/ 目录
```

## 错误处理

- **404 页面**：路由未匹配或商品/订单不存在时显示，提供"返回首页"和"返回上一页"
- **403 页面**：无访问权限时显示
- **500 页面**：服务器错误时显示，提供"刷新页面"
- **空状态组件**：购物车空、商品列表空、订单空等场景显示引导
- **加载状态组件**：数据加载中显示 loading 骨架
- **请求拦截器**：401 自动跳登录，403/500/网络异常 ElMessage 提示

## 与后端的对应关系

|前端页面|调用的后端服务|接口|
|---|---|---|
|登录/注册|cloud-auth|POST /auth/login, /auth/register|
|首页/商品列表/详情|cloud-product|GET /product/list, /product/detail/:id|
|个人中心|cloud-user|GET /user/info, PUT /user/info|
|收货地址|cloud-user|/user/address/*|
|购物车|cloud-cart|/cart/*|
|订单|cloud-order|/order/*|
|支付查询|cloud-payment|GET /payment/:orderNo|
