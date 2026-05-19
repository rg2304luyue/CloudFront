<template>
  <div class="page-container">
    <div class="page-head">
      <h2 class="page-title">商品管理</h2>
      <el-button type="primary" @click="$router.push('/seller/products/add')">
        <el-icon><Plus /></el-icon> 添加商品
      </el-button>
    </div>

    <el-table :data="products" style="width:100%" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="160" />
      <el-table-column label="主图" width="80">
        <template #default="{row}">
          <el-image v-if="row.mainImage" :src="row.mainImage" fit="cover" style="width:48px;height:48px;border-radius:6px" />
          <span v-else style="color:#ccc">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{row}">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column prop="sales" label="销量" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="{row}">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{row}">
          <el-button size="small" @click="$router.push(`/seller/products/${row.id}/edit`)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top:16px;text-align:right">
      <el-pagination
        v-model:current-page="page" :page-size="size" :total="total"
        layout="prev, pager, next" @current-change="fetchProducts"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyProducts, deleteProduct } from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'

const products = ref([]); const loading = ref(true)
const page = ref(1); const size = ref(20); const total = ref(0)

async function fetchProducts() {
  loading.value = true
  try {
    const res = await getMyProducts({ page: page.value, size: size.value })
    products.value = res.data || []
    total.value = Math.max((res.data || []).length, page.value * size.value + 1)
  } finally { loading.value = false }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.name}」？`, '提示', { type: 'warning' })
  try {
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch { /* cancelled */ }
}

onMounted(fetchProducts)
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
</style>
