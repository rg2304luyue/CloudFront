<template>
  <div class="page-container">
    <LoadingState v-if="loading" />
    <template v-else-if="product">
      <!-- Back Button -->
      <button class="btn-back" @click="router.back()">
        <el-icon :size="16"><ArrowLeft /></el-icon>
        <span>返回</span>
      </button>

      <div class="detail">
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
            <button class="btn btn-outline-danger btn-lg" :disabled="product.stock <= 0 || adding" @click="addToCart">
              <el-icon :size="18"><ShoppingCart /></el-icon>{{ product.stock <= 0 ? '已售罄' : '加入购物车' }}
            </button>
            <button class="btn btn-primary btn-lg" :disabled="product.stock <= 0 || adding" @click="buyNow">
              {{ product.stock <= 0 ? '已售罄' : '立即购买' }}
            </button>
          </div>
        </div>
      </div>
    </template>

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
const adding = ref(false)

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
  adding.value = true
  try {
    await cartStore.add(product.value.id, quantity.value)
    ElMessage.success('已添加到购物车')
  } catch {
    ElMessage.error('操作失败，请重试')
  } finally {
    adding.value = false
  }
}

async function buyNow() {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  adding.value = true
  try {
    await cartStore.add(product.value.id, quantity.value)
    // 仅在添加成功后存储标记，确保购物车页能正确定位该商品
    sessionStorage.setItem('buyNowProductId', product.value.id.toString())
    router.push('/cart')
  } catch {
    ElMessage.error('操作失败，请重试')
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 6px 8px;
  margin-bottom: 20px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: var(--primary);
  font-size: 15px;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.btn-back:hover {
  background: var(--primary-light);
}

.detail {
  display: flex;
  gap: 56px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-sm);
  animation: fade-up .5s var(--ease) both;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}

/* Gallery */
.detail-gallery {
  width: 480px;
  flex-shrink: 0;
}
.gallery-main {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  background: var(--bg);
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
  color: #c7c7cc;
  background: var(--bg);
}

/* Info */
.detail-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-top: 8px;
}

.info-header {
  margin-bottom: 28px;
}
.info-header h1 {
  font-size: 34px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.03em;
  margin-bottom: 12px;
  line-height: 1.15;
}
.info-desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.65;
}

/* Price Card */
.price-card {
  padding: 22px 0;
  margin-bottom: 24px;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}
.price-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 10px;
}
.price-label {
  font-size: 14px;
  color: var(--text-secondary);
}
.price-value {
  font-size: 34px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -.025em;
  line-height: 1;
}
.price-symbol {
  font-size: 20px;
  font-weight: 500;
  margin-right: 2px;
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
  color: #d2d2d7;
}

/* Quantity */
.quantity-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
}
.qty-label {
  font-size: 14px;
  color: var(--text-secondary);
}
.qty-input {
  width: 140px;
}
.low-stock {
  font-size: 13px;
  color: #bf4800;
  font-weight: 500;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: auto;
}
.btn-lg {
  flex: 1;
  justify-content: center;
  padding: 14px 24px;
  font-size: 16px;
}
/* Secondary action reads as a quiet tinted pill, primary stays solid blue */
.action-buttons .btn-outline-danger {
  background: var(--primary-light);
  color: var(--primary);
  box-shadow: none;
}
.action-buttons .btn-outline-danger:hover:not(:disabled) {
  background: rgba(0,113,227,.14);
}

@media (max-width: 900px) {
  .detail {
    flex-direction: column;
    gap: 28px;
    padding: 24px;
    border-radius: var(--radius-lg);
  }
  .detail-gallery {
    width: 100%;
  }
  .info-header h1 { font-size: 26px; }
  .action-buttons {
    flex-direction: column;
  }
}
</style>
