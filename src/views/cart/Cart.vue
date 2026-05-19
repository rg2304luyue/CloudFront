<template>
  <div class="page-container">
    <h2 class="page-title">购物车</h2>
    <LoadingState v-if="loading" />
    <EmptyState v-else-if="cartStore.items.length === 0" description="购物车还是空的" show-action @action="$router.push('/product/list')" />
    <template v-else>
      <div class="cart-table">
        <div class="table-header">
          <span class="col-check"></span><span class="col-img"></span><span class="col-name">商品</span><span class="col-price">单价</span><span class="col-qty">数量</span><span class="col-total">小计</span><span class="col-del"></span>
        </div>
        <div v-for="item in cartStore.items" :key="item.productId" class="table-row">
          <div class="col-check"><el-checkbox :model-value="item.checked" @change="(v) => cartStore.toggleCheck(item.productId, v)" /></div>
          <div class="col-img">
            <div class="thumb"><el-image v-if="item.mainImage" :src="item.mainImage" fit="cover"><template #error><el-icon :size="22" color="#d1d5db"><PictureFilled /></el-icon></template></el-image><el-icon v-else :size="22" color="#d1d5db"><PictureFilled /></el-icon></div>
          </div>
          <div class="col-name"><p class="item-name">{{ item.name }}</p></div>
          <div class="col-price"><span class="item-price">¥{{ item.price }}</span></div>
          <div class="col-qty"><el-input-number v-model="item.quantity" :min="1" :max="99" size="small" controls-position="right" @change="(v) => cartStore.updateQty(item.productId, v)" /></div>
          <div class="col-total"><span class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</span></div>
          <div class="col-del"><el-button link type="danger" @click="cartStore.remove(item.productId)">删除</el-button></div>
        </div>
      </div>

      <div class="cart-footer">
        <div class="footer-left">
          <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="toggleAll">全选</el-checkbox>
          <button class="clear-link" @click="cartStore.clear()">清空购物车</button>
        </div>
        <div class="footer-right">
          <span class="total-label">已选 <strong>{{ cartStore.totalCount }}</strong> 件，合计</span>
          <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          <button class="checkout-btn" :disabled="cartStore.totalCount === 0" @click="openCheckout">去结算</button>
        </div>
      </div>

      <!-- 下单弹窗 -->
      <el-dialog v-model="dialogVisible" title="确认下单" width="520px" :close-on-click-modal="false">
        <div class="dialog-body">
          <div class="block">
            <h4>收货地址</h4>
            <el-select v-model="selectedAddressId" placeholder="请选择收货地址" style="width:100%" :disabled="addresses.length === 0">
              <el-option v-for="a in addresses" :key="a.id" :label="`${a.receiverName} ${a.phone} ${a.province}${a.city}${a.district}${a.detail}`" :value="a.id" />
            </el-select>
            <p v-if="addresses.length === 0" style="color:var(--text-muted);margin-top:4px">
              暂无收货地址，请先去<a href="javascript:void(0)" @click="$router.push('/user/address');dialogVisible=false" style="color:var(--primary)">添加</a>
            </p>
          </div>
          <div class="block">
            <h4>商品清单</h4>
            <div v-for="item in checkedItems" :key="item.productId" class="order-item">
              <span class="order-item-name">{{ item.name }} ×{{ item.quantity }}</span>
              <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="block">
            <h4>备注</h4>
            <el-input v-model="remark" placeholder="选填" />
          </div>
          <div class="order-total">
            合计 <strong>¥{{ cartStore.totalPrice.toFixed(2) }}</strong>
          </div>
        </div>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="danger" @click="submitOrder" :loading="submitting" :disabled="!selectedAddressId">提交订单</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { getAddressList } from '@/api/user'
import { createOrder } from '@/api/order'
import { ElMessage } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter(); const cartStore = useCartStore()
const loading = ref(true); const dialogVisible = ref(false); const submitting = ref(false)
const addresses = ref([]); const selectedAddressId = ref(null); const remark = ref('')

const checkAll = computed({ get: () => cartStore.items.length > 0 && cartStore.items.every(i => i.checked), set: () => {} })
const indeterminate = computed(() => cartStore.items.some(i => i.checked) && !checkAll.value)
const checkedItems = computed(() => cartStore.items.filter(i => i.checked))

onMounted(async () => { await cartStore.fetchCart(); loading.value = false })

function toggleAll(v) { cartStore.items.forEach(i => { if (i.checked !== v) cartStore.toggleCheck(i.productId, v) }) }

async function openCheckout() {
  try {
    const res = await getAddressList()
    addresses.value = res.data || []
    const defAddr = addresses.value.find(a => a.isDefault === 1)
    selectedAddressId.value = defAddr ? defAddr.id : (addresses.value[0]?.id || null)
  } catch { addresses.value = [] }
  dialogVisible.value = true
}

async function submitOrder() {
  submitting.value = true
  try {
    const res = await createOrder(selectedAddressId.value, remark.value)
    ElMessage.success('下单成功')
    dialogVisible.value = false
    const orderId = res.data?.id || res.data?.order?.id
    router.push(orderId ? `/order/${orderId}` : '/order/list')
  } catch {} finally { submitting.value = false }
}
</script>

<style scoped>
/* 保持原表格样式不变 */
.cart-table { background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border); overflow: hidden; }
.table-header { display: flex; align-items: center; padding: 12px 20px; background: #f9fafb; border-bottom: 1px solid var(--border); font-size: 12px; color: var(--text-muted); }
.table-row { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); transition: background .1s; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #fafbfc; }
.col-check { width: 40px; display: flex; align-items: center; }
.col-img { width: 88px; }
.col-name { flex: 1; min-width: 0; padding-right: 12px; }
.col-price { width: 100px; text-align: center; }
.col-qty { width: 120px; display: flex; justify-content: center; }
.col-total { width: 100px; text-align: right; }
.col-del { width: 60px; text-align: right; }
.thumb { width: 72px; height: 72px; border-radius: 6px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.thumb .el-image { width: 100%; height: 100%; }
.item-name { font-size: 14px; font-weight: 500; }
.item-price { font-size: 13px; color: var(--text-secondary); }
.item-total { font-size: 14px; font-weight: 600; color: var(--danger); }

.cart-footer { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 24px; margin-top: 16px; position: sticky; bottom: 16px; }
.footer-left { display: flex; align-items: center; gap: 20px; }
.clear-link { border: none; background: none; color: var(--text-muted); font-size: 13px; cursor: pointer; }
.clear-link:hover { color: var(--danger); }
.footer-right { display: flex; align-items: center; gap: 12px; }
.total-label { font-size: 14px; color: var(--text-secondary); }
.total-price { font-size: 22px; font-weight: 700; color: var(--danger); }
.checkout-btn { padding: 10px 32px; border: none; border-radius: var(--radius); background: var(--danger); color: #fff; font-size: 15px; cursor: pointer; transition: background .15s; }
.checkout-btn:hover { background: #d94a4c; }
.checkout-btn:disabled { background: #d1d5db; cursor: not-allowed; }

/* 弹窗样式 */
.dialog-body { display: flex; flex-direction: column; gap: 16px; }
.block h4 { margin: 0 0 8px; font-size: 14px; color: var(--text); }
.order-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; color: var(--text-secondary); border-bottom: 1px solid #f0f0f0; }
.order-item:last-child { border-bottom: none; }
.order-item-name { flex: 1; }
.order-total { text-align: right; font-size: 16px; }
.order-total strong { color: var(--danger); font-size: 22px; }
</style>
