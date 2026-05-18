<template>
  <div class="page-container">
    <LoadingState v-if="loading" />
    <div v-else-if="product" class="detail">
      <div class="detail-img-box">
        <el-image v-if="product.mainImage" :src="product.mainImage" fit="cover" class="detail-img"><template #error><el-icon :size="72" color="#d1d5db"><PictureFilled /></el-icon></template></el-image>
        <el-icon v-else :size="72" color="#d1d5db"><PictureFilled /></el-icon>
      </div>
      <div class="detail-info">
        <h2>{{ product.name }}</h2>
        <p class="desc">{{ product.description || '暂无商品描述' }}</p>
        <div class="price-box">
          <span class="price-label">价格</span>
          <span class="price-value">¥{{ product.price }}</span>
        </div>
        <div class="meta">
          <div class="meta-item">库存 <strong>{{ product.stock }}</strong></div>
          <div class="meta-item">已售 <strong>{{ product.sales || 0 }}</strong></div>
        </div>
        <div class="actions">
          <el-input-number v-model="quantity" :min="1" :max="product.stock" size="large" class="qty" />
          <button class="btn-cart" @click="addToCart">加入购物车</button>
          <button class="btn-buy" @click="buyNow">立即购买</button>
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

const route = useRoute(); const router = useRouter()
const cartStore = useCartStore(); const userStore = useUserStore()
const product = ref(null); const loading = ref(true); const quantity = ref(1)

onMounted(async () => { try { const r = await getProductDetail(route.params.id); product.value = r.data } finally { loading.value = false } })

function addToCart() {
  if (!userStore.isLogin) { router.push('/login'); return }
  cartStore.add(product.value.id, quantity.value); ElMessage.success('已添加到购物车')
}
function buyNow() { addToCart(); router.push('/cart') }
</script>

<style scoped>
.detail { display: flex; gap: 40px; background: var(--bg-card); border-radius: var(--radius-lg); padding: 36px; border: 1px solid var(--border); }
.detail-img-box { width: 480px; height: 400px; border-radius: var(--radius); background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.detail-img { width: 100%; height: 100%; }
.detail-info { flex: 1; min-width: 0; }
.detail-info h2 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
.desc { font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 24px; }
.price-box { background: var(--danger-light); padding: 16px 20px; border-radius: var(--radius); margin-bottom: 16px; display: flex; align-items: baseline; gap: 12px; }
.price-label { font-size: 14px; color: var(--text-secondary); }
.price-value { font-size: 28px; font-weight: 700; color: var(--danger); }
.meta { display: flex; gap: 24px; margin-bottom: 28px; }
.meta-item { font-size: 13px; color: var(--text-secondary); }
.meta-item strong { color: var(--text); }
.actions { display: flex; gap: 10px; align-items: center; }
.qty { width: 120px; }
.btn-cart { padding: 10px 24px; border: 1px solid var(--danger); border-radius: var(--radius); background: #fff; color: var(--danger); font-size: 14px; cursor: pointer; transition: all .15s; }
.btn-cart:hover { background: var(--danger); color: #fff; }
.btn-buy { padding: 10px 24px; border: none; border-radius: var(--radius); background: var(--primary); color: #fff; font-size: 14px; cursor: pointer; transition: background .15s; }
.btn-buy:hover { background: var(--primary-dark); }
</style>
