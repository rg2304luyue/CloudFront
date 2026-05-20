<template>
  <div class="error-root">
    <div class="error-card">
      <div class="error-code">403</div>
      <div class="error-icon warn"><el-icon :size="48"><Lock /></el-icon></div>
      <h2>禁止访问</h2>
      <p>抱歉，您没有权限访问此页面</p>
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
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: -8px;
}
.error-icon.warn {
  color: #f59e0b;
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
