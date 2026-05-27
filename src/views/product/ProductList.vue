<template>
  <div class="page-container">
    <!-- Search & Filter Bar -->
    <div class="filter-bar">
      <div class="search-wrap">
        <el-icon :size="18" color="#9c9cb8"><Search /></el-icon>
        <input
          v-model="keyword"
          placeholder="搜索商品名称..."
          @keyup.enter="search"
          class="search-input"
        />
        <el-icon v-if="keyword" :size="16" color="#9c9cb8" class="clear-icon" @click="keyword='';search()">
          <Close />
        </el-icon>
      </div>

      <div class="filter-right">
        <el-select v-model="categoryId" placeholder="全部分类" clearable @change="search" class="cat-select">
          <el-option v-for="c in flatCategories" :key="c.value" :label="c.label" :value="c.value" />
        </el-select>

        <el-select v-model="sortBy" placeholder="默认排序" @change="search" class="sort-select">
          <el-option label="默认排序" value="" />
          <el-option label="价格从低到高" value="price_asc" />
          <el-option label="价格从高到低" value="price_desc" />
          <el-option label="销量优先" value="sales" />
        </el-select>
      </div>
    </div>

    <!-- States (only show full-page loading on initial load) -->
    <LoadingState v-if="loading && products.length === 0" />
    <EmptyState v-else-if="!loading && products.length === 0" description="没有找到商品，试试其他关键词" show-action @action="keyword='';categoryId=null;search()" action-text="清除筛选" />

    <!-- Product Grid -->
    <div v-else class="product-grid" :class="{ 'is-switching': switchingPage }">
      <ProductCard v-for="p in products" :key="p.id" :product="p" />
    </div>

    <!-- Pagination -->
    <div v-if="total > size" class="pagination-wrap">
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProductList, getCategoryTree } from '@/api/product'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()

const products = ref([])
const loading = ref(true)
const switchingPage = ref(false)
const total = ref(0)
const page = ref(1)
const size = ref(12)
const keyword = ref('')
const categoryId = ref(null)
const sortBy = ref('')
const flatCategories = ref([])

onMounted(async () => {
  await loadCategories()

  // Apply query params if present
  if (route.query.keyword) {
    keyword.value = route.query.keyword
  }
  await fetchProducts()
})

function flattenCategories(cats, prefix = '') {
  const r = []
  for (const c of cats) {
    r.push({ label: prefix + c.name, value: c.id })
    if (c.children?.length) {
      r.push(...flattenCategories(c.children, prefix + c.name + ' / '))
    }
  }
  return r
}

async function loadCategories() {
  try {
    const r = await getCategoryTree()
    flatCategories.value = flattenCategories(r.data || [])
  } catch {}
}

async function fetchProducts() {
  if (products.value.length === 0) {
    loading.value = true
  } else {
    switchingPage.value = true
  }
  try {
    const params = {
      categoryId: categoryId.value,
      page: page.value,
      size: size.value,
      keyword: keyword.value
    }
    if (sortBy.value) params.sortBy = sortBy.value
    const r = await getProductList(params)
    products.value = r.data || []
    total.value = r.total || 0
  } finally {
    loading.value = false
    switchingPage.value = false
  }
}

function search() {
  page.value = 1
  fetchProducts()
}
</script>

<style scoped>
/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrap {
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  padding: 0 16px;
  height: 42px;
  transition: all var(--transition-fast);
}
.search-wrap:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79,110,245,.08);
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  color: var(--text);
}
.search-input::placeholder { color: var(--text-muted); }
.clear-icon { cursor: pointer; flex-shrink: 0; }

.filter-right {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.cat-select { width: 180px; }
.sort-select { width: 160px; }

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  transition: opacity 0.15s ease;
}
.product-grid.is-switching {
  opacity: 0.5;
  pointer-events: none;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .filter-bar { flex-direction: column; }
  .search-wrap { max-width: none; }
  .filter-right { margin-left: 0; width: 100%; }
  .cat-select, .sort-select { flex: 1; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
</style>
