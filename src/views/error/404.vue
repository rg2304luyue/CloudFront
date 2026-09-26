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

<style scoped src="@/assets/error-page.css"></style>
