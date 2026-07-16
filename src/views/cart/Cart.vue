<template>
  <div class="page-container">
    <PageHeader title="购物车" subtitle="管理你的购物清单" />

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="cartStore.items.length === 0" description="购物车还是空的，快去逛逛吧" show-action @action="$router.push('/product/list')" action-text="去逛逛" />

    <template v-else>
      <!-- Cart Table -->
      <div class="cart-table card">
        <div class="table-head">
          <span class="col-check"><el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="toggleAll" /></span>
          <span class="col-img"></span>
          <span class="col-name">商品</span>
          <span class="col-price">单价</span>
          <span class="col-qty">数量</span>
          <span class="col-total">小计</span>
          <span class="col-del"></span>
        </div>

        <div v-for="item in cartStore.items" :key="item.productId" class="table-row">
          <div class="col-check">
            <el-checkbox :model-value="item.checked" @change="async (v) => { try { await cartStore.toggleCheck(item.productId, v) } catch { ElMessage.error('更新失败') } }" />
          </div>
          <div class="col-img" @click="$router.push(`/product/${item.productId}`)">
            <div class="thumb">
              <el-image v-if="item.mainImage" :src="item.mainImage" fit="cover">
                <template #error><el-icon :size="20" color="#d1d5db"><PictureFilled /></el-icon></template>
              </el-image>
              <el-icon v-else :size="20" color="#d1d5db"><PictureFilled /></el-icon>
            </div>
          </div>
          <div class="col-name" @click="$router.push(`/product/${item.productId}`)">
            <p class="item-name">{{ item.name }}</p>
          </div>
          <div class="col-price">
            <span class="item-price">¥{{ item.price }}</span>
          </div>
          <div class="col-qty">
            <el-input-number
              :model-value="item.quantity"
              :min="1"
              :max="99"
              size="small"
              controls-position="right"
              :disabled="updatingQty.has(item.productId)"
              @update:model-value="(v) => queueQuantityUpdate(item.productId, v)"
            />
          </div>
          <div class="col-total">
            <span class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="col-del">
            <el-button link type="danger" @click="async () => { try { await cartStore.remove(item.productId) } catch { ElMessage.error('删除失败') } }">
              <el-icon :size="16"><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="cart-footer card">
        <div class="footer-left">
          <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="toggleAll">全选</el-checkbox>
          <button class="clear-link" @click="ElMessageBox.confirm('确定清空购物车？', '提示', { type: 'warning' }).then(async () => { await cartStore.clear() }).catch(() => {})">清空购物车</button>
        </div>
        <div class="footer-right">
          <span class="total-label">
            已选 <strong>{{ cartStore.checkedCount }}</strong> 件，合计
          </span>
          <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          <button class="btn btn-danger btn-lg" :disabled="cartStore.checkedCount === 0" @click="openCheckout">
            去结算
          </button>
        </div>
      </div>

      <!-- Checkout Dialog -->
      <el-dialog v-model="dialogVisible" title="确认下单" width="min(560px, calc(100vw - 32px))" :close-on-click-modal="false" class="checkout-dialog">
        <div class="dialog-body">
          <div class="block">
            <h4>收货地址</h4>
            <el-select v-model="selectedAddressId" placeholder="请选择收货地址" style="width:100%" :disabled="addresses.length === 0">
              <el-option
                v-for="a in addresses"
                :key="a.id"
                :label="`${a.receiverName}  ${a.phone}  ${a.province}${a.city}${a.district}${a.detail}`"
                :value="a.id"
              />
            </el-select>
            <p v-if="addresses.length === 0" class="no-addr">
              暂无收货地址，请先去
              <a href="javascript:void(0)" @click="$router.push('/user/address');dialogVisible=false" style="color: #4f6ef5; font-weight: 600;">添加地址</a>
            </p>
          </div>

          <div class="block">
            <h4>商品清单</h4>
            <div class="order-items-list">
              <div v-for="item in checkedItems" :key="item.productId" class="order-item">
                <span class="order-item-name">{{ item.name }} ×{{ item.quantity }}</span>
                <span class="order-item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="block">
            <h4>订单备注</h4>
            <el-input v-model="remark" placeholder="选填（如有特殊要求请备注）" type="textarea" :rows="2" resize="none" />
          </div>

          <div class="dialog-total">
            <span>合计</span>
            <strong>¥{{ cartStore.totalPrice.toFixed(2) }}</strong>
          </div>
        </div>
        <template #footer>
          <el-button @click="dialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="submitOrder" :loading="submitting" :disabled="!selectedAddressId" size="large">
            提交订单
          </el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { getAddressList } from '@/api/user'
import { createOrder, getOrderToken } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(true)
const dialogVisible = ref(false)
const submitting = ref(false)
const addresses = ref([])
const selectedAddressId = ref(null)
const remark = ref('')
const orderToken = ref('')
const updatingQty = ref(new Set())

const checkAll = computed({
  get: () => cartStore.items.length > 0 && cartStore.items.every(i => i.checked),
  set: () => {}
})
const indeterminate = computed(() => cartStore.items.some(i => i.checked) && !checkAll.value)
const checkedItems = computed(() => cartStore.items.filter(i => i.checked))

onMounted(async () => {
  await cartStore.fetchCart()
  loading.value = false

  // 处理"立即购买"逻辑：只勾选指定商品
  const buyNowProductId = sessionStorage.getItem('buyNowProductId')
  if (buyNowProductId) {
    // 先取消所有勾选
    try {
      await cartStore.checkAll(false)
      // 只勾选"立即购买"的商品
      const targetItem = cartStore.items.find(i => i.productId.toString() === buyNowProductId)
      if (targetItem) {
        await cartStore.toggleCheck(targetItem.productId, true)
      }
    } catch {
      ElMessage.error('更新失败')
    }
    sessionStorage.removeItem('buyNowProductId')
  }
})

// 防抖更新数量（每个商品独立计时器，避免快速切换商品时定时器互相覆盖导致永久禁用）
const qtyTimers = new Map()
const pendingQuantities = new Map()

function queueQuantityUpdate(productId, quantity) {
  const item = cartStore.items.find(i => i.productId === productId)
  if (!item || quantity === item.quantity) return

  let pending = pendingQuantities.get(productId)
  if (!pending) {
    pending = { rollbackQuantity: item.quantity, quantity }
    pendingQuantities.set(productId, pending)
  } else {
    pending.quantity = quantity
  }

  item.quantity = quantity
  updatingQty.value.add(productId)

  if (qtyTimers.has(productId)) {
    clearTimeout(qtyTimers.get(productId))
  }

  qtyTimers.set(productId, setTimeout(() => {
    qtyTimers.delete(productId)
    void submitQuantityUpdate(productId)
  }, 500))
}

async function submitQuantityUpdate(productId) {
  const update = pendingQuantities.get(productId)
  if (!update) return

  try {
    await cartStore.updateQty(productId, update.quantity, update.rollbackQuantity)
  } catch {
    ElMessage.error('更新数量失败')
  } finally {
    pendingQuantities.delete(productId)
    updatingQty.value.delete(productId)
  }
}

onBeforeUnmount(() => {
  for (const [productId, timer] of qtyTimers.entries()) {
    clearTimeout(timer)
    void submitQuantityUpdate(productId)
  }
  qtyTimers.clear()
})

async function toggleAll(v) {
  try {
    await cartStore.checkAll(v)
  } catch {
    ElMessage.error("更新失败")
  }
}

async function openCheckout() {
  try {
    const res = await getAddressList()
    addresses.value = res.data || []
    const defAddr = addresses.value.find(a => a.isDefault === 1)
    selectedAddressId.value = defAddr ? defAddr.id : (addresses.value[0]?.id || null)
  } catch {
    addresses.value = []
  }
  try {
    const tokenRes = await getOrderToken()
    orderToken.value = tokenRes.data
  } catch {
    ElMessage.error('获取下单令牌失败')
    return
  }
  dialogVisible.value = true
}

async function submitOrder() {
  submitting.value = true
  try {
    const res = await createOrder(selectedAddressId.value, remark.value, orderToken.value)
    ElMessage.success('下单成功')
    dialogVisible.value = false
    const orderId = res.data?.id
    router.push(orderId ? `/order/${orderId}` : '/order/list')
  } catch {
    // 下单失败，token 已被消费，重新获取为下次准备
    try {
      const tokenRes = await getOrderToken()
      orderToken.value = tokenRes.data
    } catch {}
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Table */
.cart-table {
  overflow: hidden;
  margin-bottom: 16px;
}

.table-head {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: #fafbfc;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  transition: background var(--transition-fast);
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--bg-hover); }

.col-check { width: 44px; display: flex; align-items: center; }
.col-img { width: 88px; cursor: pointer; }
.col-name { flex: 1; min-width: 0; padding-right: 14px; cursor: pointer; }
.col-price { width: 110px; text-align: center; }
.col-qty { width: 130px; display: flex; justify-content: center; }
.col-total { width: 120px; text-align: right; }
.col-del { width: 48px; text-align: right; }

.thumb {
  width: 72px; height: 72px;
  border-radius: var(--radius-sm);
  background: #f5f6fa;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb .el-image { width: 100%; height: 100%; }

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-price { font-size: 14px; color: var(--text-secondary); }
.item-total { font-size: 15px; font-weight: 600; color: var(--danger); }

/* Footer */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  position: sticky;
  bottom: 16px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.clear-link {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: color var(--transition-fast);
}
.clear-link:hover { color: var(--danger); }

.footer-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.total-label {
  font-size: 14px;
  color: var(--text-secondary);
}
.total-label strong {
  color: var(--text);
  font-weight: 600;
}
.total-price {
  font-size: 24px;
  font-weight: 800;
  color: var(--danger);
  letter-spacing: -.5px;
}

/* Dialog */
.checkout-dialog .el-dialog {
  background: #fff !important;
  margin: 8vh auto 0 !important;
  max-height: 85vh !important;
  display: flex !important;
  flex-direction: column !important;
  border-radius: var(--radius) !important;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18) !important;
}

.checkout-dialog .el-dialog__header {
  padding: 28px 32px 20px !important;
  border-bottom: 1px solid #f0f0f5 !important;
  flex-shrink: 0 !important;
  background: linear-gradient(to bottom, #fafbfc, #fff) !important;
}

.checkout-dialog .el-dialog__title {
  font-size: 22px !important;
  font-weight: 700 !important;
  color: #1a1a2e !important;
  letter-spacing: -0.5px !important;
}

.checkout-dialog .el-dialog__body {
  padding: 24px 32px !important;
  overflow-y: auto !important;
  flex: 1 !important;
  background: #fff !important;
}

.checkout-dialog .el-dialog__footer {
  padding: 20px 32px !important;
  border-top: 1px solid #f0f0f5 !important;
  display: flex !important;
  justify-content: flex-end !important;
  gap: 12px !important;
  flex-shrink: 0 !important;
  background: linear-gradient(to top, #fafbfc, #fff) !important;
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.block h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.block h4::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: linear-gradient(135deg, #4f6ef5, #6c5ce7);
  border-radius: 2px;
}

.no-addr {
  color: #9c9cb8;
  font-size: 13px;
  margin-top: 8px;
  padding: 12px 16px;
  background: #f8f9fc;
  border-radius: 10px;
  border: 1px dashed #e0e0e8;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  color: #5a5a7a;
  background: #f8f9fc;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.order-item:hover {
  background: #f0f1f8;
  transform: translateX(4px);
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-item-name {
  flex: 1;
  font-weight: 500;
  color: #1a1a2e;
}

.order-item-price {
  font-weight: 600;
  color: #e8595b;
  font-size: 15px;
}

.dialog-total {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 12px;
  font-size: 16px;
  padding: 20px 0 0;
  border-top: 2px solid #f0f0f5;
  margin-top: 8px;
}

.dialog-total strong {
  font-size: 28px;
  color: #e8595b;
  font-weight: 800;
  letter-spacing: -1px;
}

/* 合计行特殊样式 */
.dialog-total::before {
  content: '';
  flex: 1;
}

/* 订单商品列表 */
.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 备注输入框样式 */
.checkout-dialog .el-textarea__inner {
  border-radius: 10px !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
  border-color: #e8e8f0 !important;
  transition: all 0.2s ease !important;
}

.checkout-dialog .el-textarea__inner:focus {
  border-color: #4f6ef5 !important;
  box-shadow: 0 0 0 3px rgba(79, 110, 245, 0.1) !important;
}

/* 提交按钮特殊样式 */
.checkout-dialog .el-button--primary {
  background: linear-gradient(135deg, #4f6ef5 0%, #6c5ce7 100%) !important;
  border: none !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 4px 16px rgba(79, 110, 245, 0.3) !important;
}

.checkout-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #3b54d4 0%, #5a4bd4 100%) !important;
  box-shadow: 0 6px 20px rgba(79, 110, 245, 0.4) !important;
  transform: translateY(-2px) !important;
}

.checkout-dialog .el-button--primary:active {
  transform: translateY(0) !important;
}

.checkout-dialog .el-button--primary.is-disabled {
  background: #c0c4cc !important;
  box-shadow: none !important;
  transform: none !important;
}

/* 取消按钮样式 */
.checkout-dialog .el-button--default {
  border-color: #e0e0e8 !important;
  color: #5a5a7a !important;
  font-weight: 500 !important;
}

.checkout-dialog .el-button--default:hover {
  border-color: #4f6ef5 !important;
  color: #4f6ef5 !important;
  background: #f5f7ff !important;
}

@media (max-width: 768px) {
  .table-head, .table-row { padding: 12px 12px; font-size: 12px; }
  .col-price, .col-total { display: none; }
  .cart-footer { flex-direction: column; gap: 12px; }
}
</style>
