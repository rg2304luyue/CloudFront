<template>
  <div
    class="product-card"
    role="link"
    tabindex="0"
    @click="$router.push(`/product/${product.id}`)"
    @keydown.enter="$router.push(`/product/${product.id}`)"
    @keydown.space.prevent="$router.push(`/product/${product.id}`)"
  >
    <div class="card-image">
      <el-image v-if="product.mainImage" :src="product.mainImage" fit="cover" class="img-main" loading="lazy">
        <template #error>
          <div class="img-fallback"><el-icon :size="36"><PictureFilled /></el-icon></div>
        </template>
      </el-image>
      <div v-else class="img-fallback"><el-icon :size="36"><PictureFilled /></el-icon></div>
      <div class="card-actions" @click.stop>
        <slot name="actions" />
      </div>
    </div>
    <div class="card-body">
      <p class="card-name">{{ product.name }}</p>
      <div class="card-footer">
        <span class="card-price">
          <span class="price-symbol">¥</span>{{ product.price }}
        </span>
        <span class="card-sales">已售 {{ product.sales || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: { type: Object, required: true }
})
</script>

<style scoped>
.product-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
}
.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}
.product-card:hover .card-image :deep(img) {
  transform: scale(1.04);
}

.card-image {
  position: relative;
  aspect-ratio: 1 / 1;
  min-height: 0;
  background: var(--bg-subtle);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-image .el-image,
.card-image .img-main {
  width: 100%;
  height: 100%;
}
.card-image :deep(img) {
  transition: transform .7s var(--ease);
}
.img-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d2d2d7;
}

.card-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity var(--transition), transform var(--transition);
}
.product-card:hover .card-actions {
  opacity: 1;
  transform: none;
}
.product-card:focus-visible {
  outline: 3px solid rgba(0,113,227,.35);
  outline-offset: 3px;
}

.card-body {
  padding: 18px 20px 20px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 10px;
  letter-spacing: -.015em;
}

.card-footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.card-price {
  font-size: 19px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -.02em;
}
.price-symbol {
  font-size: 13px;
  font-weight: 500;
  margin-right: 1px;
}

.card-sales {
  font-size: 12px;
  color: var(--text-muted);
}

@media (hover: none) {
  .card-actions { opacity: 1; transform: none; }
}
</style>
