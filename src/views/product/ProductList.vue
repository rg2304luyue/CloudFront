<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索商品名称" clearable size="large" class="search-input" @keyup.enter="search">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="categoryId" placeholder="全部分类" clearable size="large" class="category-select">
        <el-option v-for="cat in flatCategories" :key="cat.value" :label="cat.label" :value="cat.value" />
      </el-select>
      <el-button type="primary" size="large" @click="search">搜索</el-button>
    </div>

    <!-- 商品列表 -->
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="products.length === 0" description="暂无商品" />
    <div v-else class="product-grid">
      <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
        <el-image :src="product.mainImage || ''" fit="cover" class="product-img">
          <template #error><el-icon :size="64"><PictureFilled /></el-icon></template>
        </el-image>
        <div class="product-info">
          <p class="product-name">{{ product.name }}</p>
          <p class="product-price">¥{{ product.price }}</p>
          <p class="product-sales">已售 {{ product.sales || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        :page-size="size"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchProducts"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProductList, getCategoryTree } from '@/api/product'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const products = ref([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const size = ref(12)
const keyword = ref('')
const categoryId = ref(null)
const flatCategories = ref([])

onMounted(async () => {
  await loadCategories()
  await fetchProducts()
})

function flattenCategories(categories, prefix = '') {
  const result = []
  for (const cat of categories) {
    const label = prefix + cat.name
    result.push({ label, value: cat.id })
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children, label + ' / '))
    }
  }
  return result
}

async function loadCategories() {
  try {
    const res = await getCategoryTree()
    flatCategories.value = flattenCategories(res.data || [])
  } catch { /* ignore */ }
}

async function fetchProducts() {
  loading.value = true
  try {
    const res = await getProductList({ categoryId: categoryId.value, page: page.value, size: size.value, keyword: keyword.value })
    products.value = res.data || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  fetchProducts()
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.search-input {
  flex: 1;
  max-width: 400px;
}
.category-select {
  width: 200px;
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
.product-info { padding: 14px; }
.product-name { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 8px; }
.product-price { font-size: 18px; font-weight: bold; color: #f56c6c; }
.product-sales { font-size: 12px; color: #909399; margin-top: 4px; }
.pagination-wrap { display: flex; justify-content: center; margin-top: 32px; }
</style>
