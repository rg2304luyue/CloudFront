<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="hero-tag">品质保障 · 极速配送</span>
        <h1>发现好物，品质生活</h1>
        <p>CloudMall 微服务电商平台，基于 Spring Cloud Alibaba 架构</p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" @click="$router.push('/product/list')">
            立即选购 <el-icon :size="18"><ArrowRight /></el-icon>
          </button>
          <button class="btn btn-ghost btn-lg" @click="$router.push('/product/list')">
            浏览分类
          </button>
        </div>
      </div>
    </section>

    <!-- Hot Products -->
    <section class="page-container">
      <div class="section-head">
        <div>
          <h2>热门商品</h2>
          <p class="section-sub">精选优质好物，满足你的购物需求</p>
        </div>
        <router-link to="/product/list" class="more-link">
          查看全部 <el-icon :size="14"><ArrowRight /></el-icon>
        </router-link>
      </div>

      <LoadingState v-if="loading" text="正在加载..." />
      <div v-else-if="error" class="error-state">
        <el-icon :size="40" color="#86868b"><WarningFilled /></el-icon>
        <p>加载失败，请稍后重试</p>
        <button class="btn btn-primary" @click="fetchProducts">重新加载</button>
      </div>
      <EmptyState v-else-if="products.length === 0" description="暂无商品" show-action @action="$router.push('/product/list')" />

      <div v-else class="product-grid">
        <ProductCard v-for="p in products" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHotProducts } from '@/api/product'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProductCard from '@/components/ProductCard.vue'

const products = ref([])
const loading = ref(true)
const error = ref(false)

async function fetchProducts() {
  error.value = false
  loading.value = true
  try {
    const r = await getHotProducts()
    products.value = r.data || []
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchProducts())
</script>

<style scoped>
.home { padding-bottom: 32px; }

/* Hero */
.hero {
  position: relative;
  padding: 120px 24px 116px;
  text-align: center;
  overflow: hidden;
  background: #fff;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 55% at 50% 118%, rgba(0,113,227,.16), transparent 70%),
    radial-gradient(ellipse 40% 40% at 88% 10%, rgba(191,90,242,.07), transparent 72%),
    radial-gradient(ellipse 40% 40% at 10% 20%, rgba(90,200,250,.08), transparent 72%);
  pointer-events: none;
}
.hero-content {
  position: relative;
  max-width: 820px;
  margin: 0 auto;
  animation: rise .9s var(--ease) both;
}
.hero-tag {
  display: inline-block;
  color: #bf4800;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
  letter-spacing: .01em;
}
.hero h1 {
  font-size: clamp(44px, 6.4vw, 80px);
  font-weight: 700;
  letter-spacing: -.045em;
  margin-bottom: 20px;
  line-height: 1.05;
  background: linear-gradient(180deg, #1d1d1f 30%, #4a4a50 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero p {
  font-size: clamp(17px, 2vw, 21px);
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.5;
  letter-spacing: -.01em;
}
.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}

/* Section */
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}
.section-head h2 {
  font-size: 34px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.03em;
  line-height: 1.15;
}
.section-sub {
  font-size: 16px;
  color: var(--text-secondary);
  margin-top: 6px;
}
.more-link {
  font-size: 15px;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}
.more-link:hover { text-decoration: underline; }

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 64px 20px;
  color: var(--text-secondary);
}
.error-state p {
  font-size: 15px;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .hero { padding: 80px 20px 76px; }
  .section-head h2 { font-size: 26px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
}
</style>
