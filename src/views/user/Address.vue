<template>
  <div class="page-container">
    <div class="address-header">
      <h3 class="page-title">收货地址</h3>
      <el-button type="primary" @click="openDialog(null)">添加地址</el-button>
    </div>
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="addresses.length === 0" description="还没有收货地址" />
    <div v-else class="address-grid">
      <div v-for="addr in addresses" :key="addr.id" class="address-card" :class="{ 'is-default': addr.isDefault === 1 }">
        <div class="addr-header">
          <span class="addr-name">{{ addr.receiverName }}</span>
          <span class="addr-phone">{{ addr.phone }}</span>
          <el-tag v-if="addr.isDefault === 1" size="small" type="danger">默认</el-tag>
        </div>
        <p class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</p>
        <div class="addr-actions">
          <el-button link type="primary" @click="openDialog(addr)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(addr.id)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingAddr?.id ? '编辑地址' : '添加地址'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="form.receiverName" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="form.province" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="form.city" />
        </el-form-item>
        <el-form-item label="区/县" prop="district">
          <el-input v-model="form.district" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="form.detail" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAddressList, addAddress, updateAddress, deleteAddress } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const addresses = ref([])
const loading = ref(true)
const dialogVisible = ref(false)
const editingAddr = ref(null)
const formRef = ref(null)

const form = reactive({
  receiverName: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: 0
})

const rules = {
  receiverName: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区/县', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

onMounted(() => fetchAddresses())

async function fetchAddresses() {
  loading.value = true
  try {
    const res = await getAddressList()
    addresses.value = res.data || []
  } finally {
    loading.value = false
  }
}

function openDialog(addr) {
  editingAddr.value = addr
  if (addr) {
    Object.assign(form, addr)
  } else {
    Object.assign(form, { receiverName: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: 0 })
  }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (editingAddr.value?.id) {
    await updateAddress({ ...form, id: editingAddr.value.id })
  } else {
    await addAddress(form)
  }
  ElMessage.success(editingAddr.value?.id ? '更新成功' : '添加成功')
  dialogVisible.value = false
  fetchAddresses()
}

function handleDelete(id) {
  ElMessageBox.confirm('确定删除该地址？', '提示', { type: 'warning' }).then(async () => {
    await deleteAddress(id)
    ElMessage.success('已删除')
    fetchAddresses()
  }).catch(() => {})
}
</script>

<style scoped>
.address-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 600; }
.address-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.address-card { background: #fff; border-radius: 8px; padding: 20px; border: 2px solid transparent; transition: border-color .2s; }
.address-card.is-default { border-color: #f56c6c; }
.addr-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.addr-name { font-weight: 600; font-size: 15px; }
.addr-phone { color: #909399; font-size: 14px; }
.addr-detail { font-size: 13px; color: #606266; line-height: 1.6; margin-bottom: 12px; }
.addr-actions { text-align: right; }
</style>
