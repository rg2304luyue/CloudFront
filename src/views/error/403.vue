<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">403</div>
      <div class="error-icon">
        <el-icon :size="80"><Lock /></el-icon>
      </div>
      <h2 class="error-title">禁止访问</h2>
      <p class="error-desc">抱歉，您没有权限访问此页面。如果认为这是个错误，请联系管理员</p>
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
  color: #e6a23c;
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
