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
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: transform var(--transition-slow), box-shadow var(--transition-slow), border-color var(--transition-fast);
}
.product-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
.product-card:hover .card-image img {
  transform: scale(1.05);
}

.card-image {
  position: relative;
  aspect-ratio: 1 / 0.86;
  min-height: 0;
  background: #f3f4f6;
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
.card-image .el-image img,
.card-image img {
  transition: transform var(--transition-slow);
}
.img-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
}

.card-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(transparent, rgba(0,0,0,.15));
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.product-card:hover .card-actions {
  opacity: 1;
}
.product-card:focus-visible {
  outline: 3px solid rgba(79,110,245,.35);
  outline-offset: 2px;
}

.card-body {
  padding: 14px 16px;
}

.card-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 10px;
}

.card-footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.card-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--danger);
  letter-spacing: -.5px;
}
.price-symbol {
  font-size: 13px;
  font-weight: 600;
}

.card-sales {
  font-size: 12px;
  color: var(--text-muted);
}

@media (hover: none) {
  .card-actions { opacity: 1; }
}
</style>
