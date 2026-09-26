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

<style scoped src="@/assets/error-page.css"></style>
