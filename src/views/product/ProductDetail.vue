<template>
  <div class="page-container">
    <LoadingState v-if="loading" />
    <div v-else-if="product" class="detail">
      <!-- Image Section -->
      <div class="detail-gallery">
        <div class="gallery-main">
          <el-image
            v-if="product.mainImage"
            :src="product.mainImage"
            fit="cover"
            class="main-image"
          >
            <template #error>
              <div class="img-placeholder"><el-icon :size="64"><PictureFilled /></el-icon></div>
            </template>
          </el-image>
          <div v-else class="img-placeholder">
            <el-icon :size="64"><PictureFilled /></el-icon>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="detail-info">
        <div class="info-header">
          <h1>{{ product.name }}</h1>
          <p class="info-desc">{{ product.description || '暂无商品描述' }}</p>
        </div>

        <div class="price-card">
          <div class="price-row">
            <span class="price-label">价格</span>
            <span class="price-value">
              <span class="price-symbol">¥</span>{{ product.price }}
            </span>
          </div>
          <div class="price-meta">
            <span>库存 <strong>{{ product.stock }}</strong></span>
            <span class="meta-divider">|</span>
            <span>已售 <strong>{{ product.sales || 0 }}</strong> 件</span>
          </div>
        </div>

        <div class="quantity-row">
          <span class="qty-label">数量</span>
          <el-input-number
            v-model="quantity"
            :min="1"
            :max="product.stock"
            size="large"
            class="qty-input"
          />
          <span v-if="product.stock <= 10" class="low-stock">仅剩 {{ product.stock }} 件</span>
        </div>

        <div class="action-buttons">
          <button class="btn btn-outline-danger btn-lg" @click="addToCart">
            <el-icon :size="18"><ShoppingCart /></el-icon>加入购物车
          </button>
          <button class="btn btn-primary btn-lg" @click="buyNow">
            立即购买
          </button>
        </div>
      </div>
    </div>

    <EmptyState v-else description="商品不存在" @action="$router.back()" action-text="返回" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const product = ref(null)
const loading = ref(true)
const quantity = ref(1)

onMounted(async () => {
  try {
    const r = await getProductDetail(route.params.id)
    product.value = r.data
  } finally {
    loading.value = false
  }
})

async function addToCart() {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  await cartStore.add(product.value.id, quantity.value)
  ElMessage.success('已添加到购物车')
}

async function buyNow() {
  await addToCart()
  router.push('/cart')
}
</script>

<style scoped>
.detail {
  display: flex;
  gap: 40px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 36px;
  border: 1px solid var(--border);
}

/* Gallery */
.detail-gallery {
  width: 460px;
  flex-shrink: 0;
}
.gallery-main {
  width: 100%;
  height: 420px;
  border-radius: var(--radius);
  background: #f5f6fa;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main-image {
  width: 100%;
  height: 100%;
}
.main-image :deep(img) {
  object-fit: cover;
}
.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
  background: #f5f6fa;
}

/* Info */
.detail-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.info-header {
  margin-bottom: 24px;
}
.info-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.3px;
  margin-bottom: 10px;
  line-height: 1.4;
}
.info-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* Price Card */
.price-card {
  background: var(--danger-light);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 24px;
}
.price-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}
.price-label {
  font-size: 14px;
  color: var(--text-secondary);
}
.price-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--danger);
  letter-spacing: -1px;
  line-height: 1;
}
.price-symbol {
  font-size: 18px;
  font-weight: 600;
}
.price-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
}
.price-meta strong {
  color: var(--text);
  font-weight: 600;
}
.meta-divider {
  color: var(--border);
}

/* Quantity */
.quantity-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}
.qty-label {
  font-size: 14px;
  color: var(--text-secondary);
}
.qty-input {
  width: 130px;
}
.low-stock {
  font-size: 12px;
  color: var(--danger);
  font-weight: 500;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: auto;
}
.btn-lg {
  flex: 1;
  justify-content: center;
  padding: 12px 24px;
  font-size: 15px;
}

@media (max-width: 900px) {
  .detail {
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }
  .detail-gallery {
    width: 100%;
  }
  .gallery-main {
    height: 300px;
  }
  .action-buttons {
    flex-direction: column;
  }
}
</style>
