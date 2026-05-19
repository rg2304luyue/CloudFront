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
      <el-form-item label="主图" prop="mainImage">
        <div class="upload-area">
          <template v-if="!form.mainImage">
            <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="file-input" />
            <div class="upload-trigger" @click="$refs.fileInput.click()">
              <el-icon :size="32" color="#9ca3af"><Plus /></el-icon>
              <span v-if="!uploading">点击上传图片</span>
              <span v-else>上传中...</span>
            </div>
          </template>
          <template v-else>
            <div class="upload-preview">
              <el-image :src="form.mainImage" fit="contain"
                style="width:200px;height:150px;border:1px solid var(--border);border-radius:6px"
                @error="imgError = true">
                <template #error><div class="img-error">图片加载失败</div></template>
              </el-image>
              <div class="preview-actions">
                <el-input v-model="form.mainImage" placeholder="图片URL" size="small" style="width:200px" />
                <el-button size="small" type="danger" plain @click="clearImage">删除</el-button>
              </div>
            </div>
          </template>
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
import { getCategoryTree, getProductDetail, addProduct, updateProduct, uploadImage } from '@/api/product'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

import { useUserStore } from '@/stores/user'

const route = useRoute(); const router = useRouter(); const userStore = useUserStore()
const isEdit = computed(() => !!route.params.id)
const formRef = ref(null); const submitting = ref(false); const categoryTree = ref([]); const imgError = ref(false); const uploading = ref(false); const fileInput = ref(null)

const form = reactive({
  name: '', categoryId: null, price: 0, stock: 0,
  description: '', mainImage: '', images: null, status: 1
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  mainImage: [{ required: true, message: '请上传商品主图', trigger: 'change' }]
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  imgError.value = false
  uploading.value = true
  try {
    const res = await uploadImage(file)
    if (res.data) {
      form.mainImage = res.data
      ElMessage.success('上传成功')
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
    // reset file input so re-selecting the same file triggers change
    if (fileInput.value) fileInput.value.value = ''
  }
}

function clearImage() {
  form.mainImage = ''
  imgError.value = false
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

.upload-area { width: 100%; }
.file-input { display: none; }
.upload-trigger {
  width: 200px; height: 150px;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; cursor: pointer;
  transition: border-color .15s;
  color: var(--text-muted); font-size: 13px;
}
.upload-trigger:hover { border-color: var(--primary); color: var(--primary); }
.upload-preview { display: flex; flex-direction: column; gap: 8px; }
.preview-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.img-error {
  width: 200px; height: 150px;
  display: flex; align-items: center; justify-content: center;
  background: #f3f4f6; color: var(--text-muted); font-size: 13px;
}
</style>
