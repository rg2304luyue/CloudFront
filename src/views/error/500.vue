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

<style scoped src="@/assets/error-page.css"></style>
