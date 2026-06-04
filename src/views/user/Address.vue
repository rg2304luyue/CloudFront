<template>
  <div class="page-container">
    <div class="page-head">
      <PageHeader title="收货地址" subtitle="管理你的配送地址" class="head-flex" />
      <button class="btn btn-primary" @click="openDialog(null)">
        <el-icon :size="16"><Plus /></el-icon>添加地址
      </button>
    </div>

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="addresses.length === 0" description="还没有收货地址" show-action @action="openDialog(null)" action-text="添加地址" />

    <div v-else class="addr-grid">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="addr-card card"
        :class="{ 'is-default': addr.isDefault === 1 }"
      >
        <div class="addr-header">
          <div class="addr-contact">
            <span class="addr-name">{{ addr.receiverName }}</span>
            <span class="addr-phone">{{ addr.phone }}</span>
          </div>
          <span v-if="addr.isDefault === 1" class="default-tag">默认</span>
        </div>
        <p class="addr-full">
          {{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}
        </p>
        <div class="addr-actions">
          <button class="link" @click="openDialog(addr)">编辑</button>
          <button class="link danger" @click="handleDelete(addr.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingAddr?.id ? '编辑地址' : '添加地址'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="form.receiverName" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="regionValues"
            :options="regionData"
            placeholder="请选择省 / 市 / 区"
            style="width: 100%"
            @change="onRegionChange"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="form.detail" placeholder="街道、门牌号等" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
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
import { ref, reactive, onMounted } from 'vue'
import { getAddressList, addAddress, updateAddress, deleteAddress } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import regionData from '@/data/regions.json'

const addresses = ref([])
const loading = ref(true)
const saving = ref(false)
const dialogVisible = ref(false)
const editingAddr = ref(null)
const formRef = ref(null)

const form = reactive({
  receiverName: '', phone: '', province: '', city: '',
  district: '', detail: '', isDefault: 0, region: ''
})

const regionValues = ref([])

function onRegionChange(values) {
  if (values && values.length === 3) {
    form.province = values[0]
    form.city = values[1]
    form.district = values[2]
    form.region = values.join('/')
  }
}

const rules = {
  receiverName: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  region: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

onMounted(() => fetchAddresses())

async function fetchAddresses() {
  loading.value = true
  try {
    const r = await getAddressList()
    addresses.value = r.data || []
  } finally {
    loading.value = false
  }
}

function openDialog(addr) {
  editingAddr.value = addr
  Object.assign(form, addr || {
    receiverName: '', phone: '', province: '', city: '',
    district: '', detail: '', isDefault: 0, region: ''
  })
  if (addr?.province) {
    regionValues.value = [addr.province, addr.city, addr.district]
    form.region = [addr.province, addr.city, addr.district].join('/')
  } else {
    regionValues.value = []
    form.region = ''
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!regionValues.value || regionValues.value.length !== 3) {
    ElMessage.warning('请选择所在地区')
    return
  }
  const v = await formRef.value.validate().catch(() => false)
  if (!v) return
  saving.value = true
  try {
    if (editingAddr.value?.id) {
      await updateAddress(editingAddr.value.id, { ...form })
    } else {
      await addAddress(form)
    }
    ElMessage.success('已保存')
    dialogVisible.value = false
    fetchAddresses()
  } catch {} finally {
    saving.value = false
  }
}

const deletingId = ref(null)
function handleDelete(id) {
  ElMessageBox.confirm('确定删除该地址？', '提示', { type: 'warning' })
    .then(async () => {
      deletingId.value = id
      try {
        await deleteAddress(id)
        ElMessage.success('已删除')
        fetchAddresses()
      } catch {} finally {
        deletingId.value = null
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
.head-flex { flex: 1; }

.addr-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.addr-card {
  padding: 20px;
  position: relative;
}
.addr-card.is-default {
  border-color: var(--primary);
  background: #fafaff;
}

.addr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.addr-contact {
  display: flex;
  align-items: center;
  gap: 10px;
}
.addr-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
}
.addr-phone {
  color: var(--text-secondary);
  font-size: 13px;
}

.default-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.addr-full {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 14px;
}

.addr-actions {
  display: flex;
  gap: 16px;
}
.link {
  border: none;
  background: none;
  font-size: 12px;
  cursor: pointer;
  color: var(--primary);
  padding: 0;
  transition: color var(--transition-fast);
}
.link.danger {
  color: var(--text-muted);
}
.link.danger:hover {
  color: var(--danger);
}

@media (max-width: 640px) {
  .addr-grid {
    grid-template-columns: 1fr;
  }
}
</style>
