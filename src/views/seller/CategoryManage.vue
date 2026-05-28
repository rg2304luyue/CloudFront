<template>
  <div class="page-container">
    <div class="page-head">
      <PageHeader title="分类管理" subtitle="管理商品分类层级" class="head-flex" />
      <el-button type="primary" @click="showDialog(null)">
        <el-icon><Plus /></el-icon>添加分类
      </el-button>
    </div>

    <div class="card" style="overflow:hidden;max-width:720px">
      <el-table :data="flatCategories" style="width:100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column label="名称" min-width="200">
          <template #default="{row}">
            <span :style="{ paddingLeft: (row._level * 28) + 'px' }">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="160">
          <template #default="{row}">
            <el-button size="small" @click="showDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingCat?.id ? '编辑分类' : '添加分类'" width="420px">
      <el-form :model="catForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="catForm.name" placeholder="分类名称" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-tree-select
            v-model="catForm.parentId"
            :data="categoryTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="无（顶级分类）"
            style="width:100%"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="catForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getCategoryTree, addCategory, updateCategory, deleteCategory } from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'

const loading = ref(true)
const saving = ref(false)
const dialogVisible = ref(false)
const editingCat = ref(null)
const categoryTree = ref([])
const catForm = reactive({ name: '', parentId: null, sort: 0 })

const flatCategories = computed(() => {
  const result = []
  function flatten(list, level) {
    for (const c of list) {
      result.push({ ...c, _level: level })
      if (c.children) flatten(c.children, level + 1)
    }
  }
  flatten(categoryTree.value, 0)
  return result
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getCategoryTree()
    categoryTree.value = res.data || []
  } finally {
    loading.value = false
  }
}

function showDialog(cat) {
  editingCat.value = cat
  catForm.name = cat?.name || ''
  catForm.parentId = cat?.parentId || null
  catForm.sort = cat?.sort || 0
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingCat.value?.id) {
      await updateCategory(editingCat.value.id, { ...catForm })
      ElMessage.success('更新成功')
    } else {
      await addCategory(catForm)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {} finally {
    saving.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除分类「${row.name}」？`, '提示', { type: 'warning' })
  try {
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {}
}

onMounted(fetchData)
</script>

<style scoped>
.head-flex { flex: 1; }
</style>
