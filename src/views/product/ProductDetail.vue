<template>
  <div class="page-container">
    <LoadingState v-if="loading" />
    <div v-else-if="product" class="product-detail">
      <div class="detail-left">
        <el-image :src="product.mainImage || ''" fit="cover" class="detail-img">
          <template #error><el-icon :size="80"><PictureFilled /></el-icon></template>
        </el-image>
      </div>
      <div class="detail-right">
        <h2 class="product-title">{{ product.name }}</h2>
        <p class="product-desc">{{ product.description || '暂无描述' }}</p>
        <div class="product-price-box">
          <span class="price-label">价格</span>
          <span class="price-value">¥{{ product.price }}</span>
        </div>
        <div class="product-meta">
          <span>库存: {{ product.stock }}</span>
          <span>已售: {{ product.sales || 0 }}</span>
        </div>
        <div class="product-actions">
          <el-input-number v-model="quantity" :min="1" :max="product.stock" size="large" />
          <el-button type="danger" size="large" @click="addToCart">加入购物车</el-button>
          <el-button type="primary" size="large" @click="buyNow">立即购买</el-button>
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
    const res = await getProductDetail(route.params.id)
    product.value = res.data
  } finally {
    loading.value = false
  }
})

function addToCart() {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  cartStore.add(product.value.id, quantity.value)
  ElMessage.success('已添加到购物车')
}

function buyNow() {
  if (!userStore.isLogin) {
    router.push('/login')
    return
  }
  addToCart()
  router.push('/cart')
}
</script>

<style scoped>
.product-detail {
  display: flex;
  gap: 40px;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
}
.detail-left { flex-shrink: 0; width: 500px; }
.detail-img { width: 100%; height: 400px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; border-radius: 8px; }
.detail-right { flex: 1; }
.product-title { font-size: 24px; font-weight: 600; margin-bottom: 12px; }
.product-desc { font-size: 14px; color: #909399; margin-bottom: 24px; line-height: 1.8; }
.product-price-box { background: #fef0f0; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
.price-label { font-size: 14px; color: #909399; margin-right: 12px; }
.price-value { font-size: 28px; font-weight: bold; color: #f56c6c; }
.product-meta { display: flex; gap: 24px; font-size: 13px; color: #909399; margin-bottom: 24px; }
.product-actions { display: flex; gap: 12px; align-items: center; }
</style>
