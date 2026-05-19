<template>
  <div class="page-container">
    <h2 class="page-title">商品审核</h2>

    <el-table :data="products" style="width:100%" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="160" />
      <el-table-column label="主图" width="80">
        <template #default="{row}">
          <el-image v-if="row.mainImage" :src="row.mainImage" fit="cover" style="width:48px;height:48px;border-radius:6px" />
          <span v-else style="color:#ccc">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" />
      <el-table-column label="价格" width="100">
        <template #default="{row}">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column label="卖家ID" width="160" prop="sellerId" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{row}">
          <el-button size="small" type="success" @click="handleReview(row, true)">通过</el-button>
          <el-button size="small" type="danger" @click="handleReview(row, false)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top:16px;display:flex;justify-content:center">
      <el-pagination background layout="prev,next" :page-size="size" :total="total" v-model:current-page="page" @current-change="fetchData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getPendingProducts, reviewProduct } from '@/api/product'
import { ElMessage } from 'element-plus'

const products = ref([]); const loading = ref(true)
const page = ref(1); const size = ref(20); const total = ref(0)
let timer = null

onMounted(() => { fetchData(); timer = setInterval(fetchDataSilent, 30000) })
onBeforeUnmount(() => clearInterval(timer))

async function fetchData() {
  loading.value = true
  try {
    const res = await getPendingProducts({ page: page.value, size: size.value })
    products.value = res.data || []
    total.value = (res.data || []).length
  } finally { loading.value = false }
}

async function fetchDataSilent() {
  try {
    const res = await getPendingProducts({ page: page.value, size: size.value })
    products.value = res.data || []
    total.value = (res.data || []).length
  } catch {}
}

async function handleReview(product, approved) {
  try {
    await reviewProduct(product.id, approved)
    ElMessage.success(approved ? '已通过' : '已拒绝')
    products.value = products.value.filter(p => p.id !== product.id)
  } catch {}
}
</script>
