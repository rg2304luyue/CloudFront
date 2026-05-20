<template>
  <div class="error-root">
    <div class="error-card">
      <div class="error-code">404</div>
      <div class="error-icon"><el-icon :size="48"><Search /></el-icon></div>
      <h2>页面未找到</h2>
      <p>您访问的页面不存在，链接可能已失效或地址输入有误</p>
      <div class="error-actions">
        <button class="btn btn-primary" @click="$router.push('/home')">返回首页</button>
        <button class="btn btn-ghost" @click="$router.back()">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.error-root {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px);
  padding: 40px 24px;
  background: var(--bg);
}
.error-card {
  text-align: center;
  max-width: 440px;
}
.error-code {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #e8e8f0 0%, #f0f0f5 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: -8px;
}
.error-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}
.error-card h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}
.error-card p {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 30px;
  line-height: 1.6;
}
.error-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
