<template>
  <div class="loading-state" v-loading="loading" :element-loading-text="text">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: true },
  text: { type: String, default: '加载中...' }
})
</script>

<style scoped>
.loading-state {
  min-height: 200px;
}
</style>
