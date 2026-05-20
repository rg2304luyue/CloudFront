<template>
  <div class="error-root">
    <div class="error-card">
      <div class="error-code">500</div>
      <div class="error-icon danger"><el-icon :size="48"><WarningFilled /></el-icon></div>
      <h2>服务器内部错误</h2>
      <p>服务器遇到了意外错误，我们正在尝试修复，请稍后再试</p>
      <div class="error-actions">
        <button class="btn btn-primary" @click="reload">刷新页面</button>
        <button class="btn btn-ghost" @click="$router.push('/home')">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
function reload() { window.location.reload() }
</script>

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
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: -8px;
}
.error-icon.danger {
  color: #ef4444;
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
