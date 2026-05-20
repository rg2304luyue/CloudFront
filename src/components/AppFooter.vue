<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-col">
        <div class="footer-brand">
          <div class="footer-logo"><el-icon :size="18"><ShoppingBag /></el-icon></div>
          <span>CloudMall</span>
        </div>
        <p class="footer-desc">基于 Spring Cloud Alibaba 微服务架构的全栈电商平台，集成支付宝沙箱支付。</p>
      </div>

      <div class="footer-col">
        <h4>快速链接</h4>
        <router-link to="/home">首页</router-link>
        <router-link to="/product/list">商品列表</router-link>
        <router-link to="/cart">购物车</router-link>
        <router-link to="/order/list">我的订单</router-link>
      </div>

      <div class="footer-col">
        <h4>个人中心</h4>
        <router-link to="/user/info">个人资料</router-link>
        <router-link to="/user/address">收货地址</router-link>
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
      </div>

      <div class="footer-col">
        <h4>技术栈</h4>
        <span>Vue 3 + Element Plus</span>
        <span>Spring Cloud Alibaba</span>
        <span>RocketMQ + Kafka</span>
        <span>MySQL + Redis</span>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2025 CloudMall. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px 28px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 32px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.footer-logo {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  background: var(--primary-gradient);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.footer-brand span {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.footer-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
}

.footer-col h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 14px;
}

.footer-col a,
.footer-col span {
  display: block;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
  transition: color var(--transition-fast);
  line-height: 1.4;
}
.footer-col a:hover {
  color: var(--primary);
}

.footer-bottom {
  border-top: 1px solid var(--border-light);
  padding: 16px 32px;
  text-align: center;
}
.footer-bottom p {
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 480px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
