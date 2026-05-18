<template>
  <div class="page-container">
    <div class="search-bar">
      <div class="search-input-wrap">
        <el-icon :size="18" color="#9ca3af"><Search /></el-icon>
        <input v-model="keyword" placeholder="搜索商品名称..." @keyup.enter="search" class="search-input" />
        <el-icon v-if="keyword" :size="16" color="#9ca3af" class="clear-icon" @click="keyword='';search()"><Close /></el-icon>
      </div>
      <div class="category-select">
        <el-select v-model="categoryId" placeholder="全部分类" clearable size="large" class="select-inner">
          <el-option v-for="c in flatCategories" :key="c.value" :label="c.label" :value="c.value" />
        </el-select>
      </div>
    </div>

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="products.length === 0" description="没有找到商品" />
    <div v-else class="grid">
      <div v-for="p in products" :key="p.id" class="card" @click="$router.push(`/product/${p.id}`)">
        <div class="card-img">
          <el-image v-if="p.mainImage" :src="p.mainImage" fit="cover"><template #error><el-icon :size="40" color="#d1d5db"><PictureFilled /></el-icon></template></el-image>
          <el-icon v-else :size="40" color="#d1d5db"><PictureFilled /></el-icon>
        </div>
        <div class="card-body">
          <p class="card-name">{{ p.name }}</p>
          <div class="card-bottom">
            <span class="card-price">¥{{ p.price }}</span>
            <span class="card-sales">已售 {{ p.sales || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > size" class="pagination-wrap">
      <el-pagination v-model:current-page="page" :page-size="size" :total="total" layout="prev, pager, next" @current-change="fetchProducts" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProductList, getCategoryTree } from '@/api/product'
import { Search, Close, PictureFilled } from '@element-plus/icons-vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const products = ref([]); const loading = ref(true); const total = ref(0)
const page = ref(1); const size = ref(12); const keyword = ref(''); const categoryId = ref(null)
const flatCategories = ref([])

onMounted(async () => { await loadCategories(); await fetchProducts() })

function flattenCategories(cats, prefix = '') {
  const r = []
  for (const c of cats) { r.push({ label: prefix + c.name, value: c.id }); if (c.children?.length) r.push(...flattenCategories(c.children, prefix + c.name + ' / ')) }
  return r
}
async function loadCategories() { try { const r = await getCategoryTree(); flatCategories.value = flattenCategories(r.data || []) } catch {} }
async function fetchProducts() { loading.value = true; try { const r = await getProductList({ categoryId: categoryId.value, page: page.value, size: size.value, keyword: keyword.value }); products.value = r.data || []; total.value = r.total || 0 } finally { loading.value = false } }
function search() { page.value = 1; fetchProducts() }
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input-wrap { flex: 1; max-width: 480px; display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 0 14px; height: 44px; transition: border-color .15s; }
.search-input-wrap:focus-within { border-color: var(--primary); }
.search-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; color: var(--text); }
.search-input::placeholder { color: var(--text-muted); }
.clear-icon { cursor: pointer; }
.category-select { width: 200px; }
.select-inner { width: 100%; }

.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.card { background: var(--bg-card); border-radius: var(--radius); overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all .15s; }
.card:hover { border-color: var(--primary); box-shadow: var(--shadow-md); transform: translateY(-2px); }
.card-img { height: 200px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
.card-img .el-image { width: 100%; height: 100%; }
.card-body { padding: 14px; }
.card-name { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 10px; }
.card-bottom { display: flex; justify-content: space-between; align-items: baseline; }
.card-price { font-size: 18px; font-weight: 700; color: var(--danger); }
.card-sales { font-size: 12px; color: var(--text-muted); }
.pagination-wrap { display: flex; justify-content: center; margin-top: 28px; }
</style>
