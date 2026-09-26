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
  background: var(--bg);
  border-top: 1px solid var(--border-light);
  margin-top: auto;
}

.footer-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 44px 40px 28px;
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 40px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.footer-logo {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: var(--text);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.footer-brand span {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -.02em;
}

.footer-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 300px;
}

.footer-col h4 {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.footer-col a,
.footer-col > span {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 9px;
  transition: color var(--transition-fast);
  line-height: 1.4;
}
.footer-col a:hover {
  color: var(--text);
  text-decoration: underline;
}

.footer-bottom {
  max-width: 1080px;
  margin: 0 auto;
  border-top: 1px solid var(--border-light);
  padding: 18px 40px 24px;
}
.footer-bottom p {
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    padding: 36px 20px 24px;
  }
  .footer-bottom { padding: 16px 20px 24px; }
}
@media (max-width: 480px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
