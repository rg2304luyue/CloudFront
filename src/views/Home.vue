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

onMounted(async () => {
  try {
    const r = await getHotProducts()
    products.value = r.data || []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home { padding-bottom: 48px; }

/* Hero */
.hero {
  position: relative;
  padding: 80px 24px 88px;
  text-align: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,110,245,.08), transparent),
    radial-gradient(ellipse 60% 50% at 80% 80%, rgba(108,92,231,.05), transparent),
    var(--bg);
}
.hero-content {
  position: relative;
  max-width: 640px;
  margin: 0 auto;
}
.hero-tag {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  background: var(--primary-light);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 1px;
}
.hero h1 {
  font-size: 38px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1px;
  margin-bottom: 10px;
  line-height: 1.3;
}
.hero p {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 30px;
  line-height: 1.6;
}
.hero-actions {
  display: flex;
  gap: 10px;
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
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -.3px;
}
.section-sub {
  font-size: 13px;
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

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .hero { padding: 52px 20px 60px; }
  .hero h1 { font-size: 28px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
</style>
