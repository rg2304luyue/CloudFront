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
        <el-icon :size="40" color="#9c9cb8"><WarningFilled /></el-icon>
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
.home { padding-bottom: 48px; }

/* Hero */
.hero {
  position: relative;
  padding: 116px 24px 112px;
  text-align: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 78% at 50% 0%, rgba(0,113,227,.13), transparent 68%),
    radial-gradient(ellipse 36% 42% at 8% 85%, rgba(120,194,255,.14), transparent 76%),
    #fbfbfd;
}
.hero-content {
  position: relative;
  max-width: 780px;
  margin: 0 auto;
}
.hero-tag {
  display: inline-block;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: rgba(0,113,227,.09);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: .08em;
}
.hero h1 {
  font-size: clamp(42px, 6vw, 72px);
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.065em;
  margin-bottom: 18px;
  line-height: 1.08;
}
.hero p {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 36px;
  line-height: 1.6;
}
.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Section */
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}
.section-head h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.04em;
}
.section-sub {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}
.more-link {
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color var(--transition-fast);
  white-space: nowrap;
}
.more-link:hover { color: var(--primary); }

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
  color: var(--text-muted);
}
.error-state p {
  font-size: 14px;
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
  .hero { padding: 76px 20px 72px; }
  .hero h1 { font-size: 40px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
</style>
