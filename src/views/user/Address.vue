<template>
  <div class="page-container">
    <div class="head-row">
      <h2 class="page-title" style="margin-bottom:0">收货地址</h2>
      <button class="btn-primary" @click="openDialog(null)">添加地址</button>
    </div>
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="addresses.length === 0" description="还没有收货地址" />
    <div v-else class="grid">
      <div v-for="addr in addresses" :key="addr.id" class="addr-card" :class="{ primary: addr.isDefault === 1 }">
        <div class="addr-head">
          <span class="addr-name">{{ addr.receiverName }}</span>
          <span class="addr-phone">{{ addr.phone }}</span>
          <span v-if="addr.isDefault===1" class="tag">默认</span>
        </div>
        <p class="addr-text">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</p>
        <div class="addr-actions">
          <button class="link" @click="openDialog(addr)">编辑</button>
          <button class="link danger" @click="handleDelete(addr.id)">删除</button>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingAddr?.id ? '编辑地址' : '添加地址'" width="480px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
        <el-form-item label="收货人" prop="receiverName"><el-input v-model="form.receiverName" /></el-form-item>
        <el-form-item label="电话" prop="phone"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="省份" prop="province"><el-input v-model="form.province" /></el-form-item>
        <el-form-item label="城市" prop="city"><el-input v-model="form.city" /></el-form-item>
        <el-form-item label="区/县" prop="district"><el-input v-model="form.district" /></el-form-item>
        <el-form-item label="详细地址" prop="detail"><el-input v-model="form.detail" /></el-form-item>
        <el-form-item label="默认地址"><el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" /></el-form-item>
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

const addresses = ref([]); const loading = ref(true); const dialogVisible = ref(false); const editingAddr = ref(null); const formRef = ref(null)
const form = reactive({ receiverName:'', phone:'', province:'', city:'', district:'', detail:'', isDefault:0 })
const rules = { receiverName:[{required:true,message:'请输入'}], phone:[{required:true,message:'请输入'}], province:[{required:true,message:'请输入'}], city:[{required:true,message:'请输入'}], district:[{required:true,message:'请输入'}], detail:[{required:true,message:'请输入'}] }

onMounted(() => fetchAddresses())
async function fetchAddresses() { loading.value=true; try { const r = await getAddressList(); addresses.value = r.data || [] } finally { loading.value=false } }
function openDialog(addr) { editingAddr.value=addr; Object.assign(form, addr||{ receiverName:'',phone:'',province:'',city:'',district:'',detail:'',isDefault:0 }); dialogVisible.value=true }
async function handleSave() { const v = await formRef.value.validate().catch(()=>false); if(!v) return; editingAddr.value?.id ? await updateAddress({...form,id:editingAddr.value.id}) : await addAddress(form); ElMessage.success('已保存'); dialogVisible.value=false; fetchAddresses() }
function handleDelete(id) { ElMessageBox.confirm('确定删除？','提示',{type:'warning'}).then(async()=>{await deleteAddress(id); ElMessage.success('已删除'); fetchAddresses()}).catch(()=>{}) }
</script>

<style scoped>
.head-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-primary { padding: 8px 20px; border: none; border-radius: 6px; background: var(--primary); color: #fff; font-size: 13px; cursor: pointer; transition: background .15s; }
.btn-primary:hover { background: var(--primary-dark); }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.addr-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; transition: border-color .15s; }
.addr-card.primary { border-color: var(--primary); }
.addr-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.addr-name { font-weight: 600; font-size: 14px; }
.addr-phone { color: var(--text-secondary); font-size: 13px; }
.tag { font-size: 11px; padding: 1px 8px; border-radius: 100px; background: var(--primary-light); color: var(--primary); font-weight: 500; }
.addr-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px; }
.addr-actions { display: flex; gap: 16px; }
.link { border: none; background: none; font-size: 12px; cursor: pointer; color: var(--primary); }
.link.danger { color: var(--text-muted); }
.link.danger:hover { color: var(--danger); }
</style>
