<template>
  <div class="page-container">
    <div class="page-head">
      <h2 class="page-title">{{ isEdit ? '编辑商品' : '添加商品' }}</h2>
    </div>

    <el-form :model="form" label-width="80px" style="max-width:600px" ref="formRef" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-tree-select
          v-model="form.categoryId" :data="categoryTree"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          placeholder="选择分类" style="width:100%" check-strictly
        />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="2" />
      </el-form-item>
      <el-form-item label="库存" prop="stock">
        <el-input-number v-model="form.stock" :min="0" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="主图URL">
        <div style="display:flex;flex-direction:column;gap:8px">
          <el-input v-model="form.mainImage" placeholder="图片直链，如 https://xxx.jpg" />
          <el-image v-if="form.mainImage" :src="form.mainImage" fit="contain"
            style="width:200px;height:150px;border:1px solid var(--border);border-radius:6px"
            @error="imgError = true"
          >
            <template #error><div class="img-error">图片加载失败</div></template>
          </el-image>
        </div>
      </el-form-item>
      <el-form-item v-if="userStore.isAdmin" label="状态">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">上架</el-radio>
          <el-radio :value="0">下架</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategoryTree, getProductDetail, addProduct, updateProduct } from '@/api/product'
import { ElMessage } from 'element-plus'

import { useUserStore } from '@/stores/user'

const route = useRoute(); const router = useRouter(); const userStore = useUserStore()
const isEdit = computed(() => !!route.params.id)
const formRef = ref(null); const submitting = ref(false); const categoryTree = ref([]); const imgError = ref(false)

const form = reactive({
  name: '', categoryId: null, price: 0, stock: 0,
  description: '', mainImage: '', images: null, status: 1
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

onMounted(async () => {
  const catRes = await getCategoryTree()
  categoryTree.value = catRes.data || []
  if (isEdit.value) {
    const res = await getProductDetail(route.params.id)
    Object.assign(form, res.data)
  }
})

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateProduct({ id: route.params.id, ...form })
      ElMessage.success('更新成功')
    } else {
      await addProduct(form)
      ElMessage.success('添加成功')
    }
    router.push('/seller/products')
  } catch {} finally { submitting.value = false }
}
</script>

<style scoped>
.page-head { margin-bottom: 20px; }
</style>
