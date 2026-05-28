<template>
  <div class="page-container">
    <div class="page-head">
      <PageHeader title="商品管理" subtitle="管理你发布的商品" class="head-flex" />
      <el-button type="primary" @click="$router.push('/seller/products/add')">
        <el-icon><Plus /></el-icon>添加商品
      </el-button>
    </div>

    <div class="card" style="overflow:hidden">
      <el-table :data="products" style="width:100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column label="主图" width="80">
          <template #default="{row}">
            <el-image v-if="row.mainImage" :src="row.mainImage" fit="cover" style="width:48px;height:48px;border-radius:6px" />
            <span v-else class="text-muted text-sm">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{row}">
            <span class="text-danger" style="font-weight:600">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{row}">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'warning' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : row.status === 2 ? '审核中' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{row}">
            <el-button size="small" @click="$router.push(`/seller/products/${row.id}/edit`)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="margin-top:18px;text-align:right">
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getMyProducts, deleteProduct } from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'

const products = ref([])
const loading = ref(true)
const page = ref(1)
const size = ref(20)
const total = ref(0)
let timer = null

async function fetchProducts() {
  loading.value = true
  try {
    const res = await getMyProducts({ page: page.value, size: size.value })
    products.value = res.data || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function fetchProductsSilent() {
  try {
    const res = await getMyProducts({ page: page.value, size: size.value })
    products.value = res.data || []
    total.value = res.total || 0
  } catch {}
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.name}」？`, '提示', { type: 'warning' })
  try {
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch {}
}

onMounted(() => {
  fetchProducts()
  timer = setInterval(fetchProductsSilent, 30000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.head-flex { flex: 1; }
</style>
