<template>
  <div class="error-page">
    <div class="error-card">
      <div class="code">404</div>
      <el-icon :size="56" color="#d1d5db"><Search /></el-icon>
      <h2>页面未找到</h2>
      <p>您访问的页面不存在，链接可能已失效或地址输入有误</p>
      <div class="btns">
        <button class="btn-primary" @click="$router.push('/home')">返回首页</button>
        <button class="btn-ghost" @click="$router.back()">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.error-page { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 120px); padding: 20px; }
.error-card { text-align: center; padding: 48px 40px; }
.code { font-size: 100px; font-weight: 800; color: #f3f4f6; line-height: 1; margin-bottom: -8px; }
h2 { font-size: 20px; font-weight: 600; margin: 16px 0 8px; }
p { font-size: 14px; color: var(--text-muted); margin-bottom: 28px; }
.btns { display: flex; gap: 10px; justify-content: center; }
.btn-primary { padding: 9px 24px; border: none; border-radius: 6px; background: var(--primary); color: #fff; font-size: 14px; cursor: pointer; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-ghost { padding: 9px 24px; border: 1px solid var(--border); border-radius: 6px; background: #fff; color: var(--text); font-size: 14px; cursor: pointer; }
.btn-ghost:hover { border-color: var(--primary); color: var(--primary); }
</style>
