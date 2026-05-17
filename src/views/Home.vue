<template>
  <div class="home-page">
    <!-- Banner -->
    <div class="home-banner">
      <div class="banner-content">
        <h1>欢迎来到 CloudMall</h1>
        <p>基于 Spring Cloud Alibaba 微服务架构的电商平台</p>
        <el-button type="primary" size="large" @click="$router.push('/product/list')">
          立即选购 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 热门商品 -->
    <div class="page-container">
      <div class="section-header">
        <h3>热门商品</h3>
        <router-link to="/product/list" class="more-link">查看更多 <el-icon><ArrowRight /></el-icon></router-link>
      </div>
      <LoadingState v-if="loading" />
      <EmptyState v-else-if="products.length === 0" description="暂无商品" show-action action-text="去看看分类" @action="$router.push('/product/list')" />
      <div v-else class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
          <el-image :src="product.mainImage || defaultImg" fit="cover" class="product-img">
            <template #error><el-icon :size="48"><PictureFilled /></el-icon></template>
          </el-image>
          <div class="product-info">
            <p class="product-name">{{ product.name }}</p>
            <p class="product-price">¥{{ product.price }}</p>
            <p class="product-sales">已售 {{ product.sales || 0 }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProductList } from '@/api/product'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const products = ref([])
const loading = ref(true)
const defaultImg = ''

onMounted(async () => {
  try {
    const res = await getProductList({ page: 1, size: 8 })
    products.value = res.data || []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-banner {
  background: linear-gradient(135deg, #409eff 0%, #3375c7 100%);
  padding: 80px 40px;
  text-align: center;
  color: #fff;
}
.banner-content h1 {
  font-size: 36px;
  margin-bottom: 12px;
}
.banner-content p {
  font-size: 16px;
  margin-bottom: 24px;
  opacity: .85;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32px 0 20px;
}
.section-header h3 {
  font-size: 20px;
  font-weight: 600;
}
.more-link {
  font-size: 14px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}
.more-link:hover {
  color: #409eff;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,.1);
}
.product-img {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.product-info {
  padding: 14px;
}
.product-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}
.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}
.product-sales {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
