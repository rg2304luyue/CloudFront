<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-icon">
        <el-icon :size="80"><Search /></el-icon>
      </div>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-desc">您访问的页面不存在，链接可能已失效或地址输入有误</p>
      <div class="error-actions">
        <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
        <el-button @click="$router.back()">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
}
.error-content {
  text-align: center;
  padding: 60px 40px;
}
.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #e6e8eb;
  line-height: 1;
  letter-spacing: 8px;
}
.error-icon {
  margin: -20px 0 20px;
  color: #c0c4cc;
}
.error-title {
  font-size: 22px;
  color: #303133;
  margin-bottom: 12px;
}
.error-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 32px;
}
.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
