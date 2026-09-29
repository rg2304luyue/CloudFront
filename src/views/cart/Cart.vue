<template>
  <div class="page-container">
    <PageHeader title="购物车" subtitle="管理你的购物清单" />
    <el-alert v-if="checkout.message.value" :title="checkout.message.value" type="info" :closable="false" show-icon />
    <el-button v-if="checkout.locked.value" :loading="checkout.busy.value" @click="checkout.refresh()">继续查询下单结果</el-button>
    <el-button v-if="checkout.locked.value && checkout.status.value === 'READY'" :disabled="checkout.busy.value" @click="dialogVisible = true">查看并重试原请求</el-button>

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="cartStore.items.length === 0" description="购物车还是空的，快去逛逛吧" show-action @action="$router.push('/product/list')" action-text="去逛逛" />

    <template v-else>
      <!-- Cart Table -->
      <div class="cart-table card">
        <div class="table-head">
          <span class="col-check"><el-checkbox v-model="checkAll" :disabled="checkout.locked.value" :indeterminate="indeterminate" @change="toggleAll" /></span>
          <span class="col-img"></span>
          <span class="col-name">商品</span>
          <span class="col-price">单价</span>
          <span class="col-qty">数量</span>
          <span class="col-total">小计</span>
          <span class="col-del"></span>
        </div>

        <div v-for="item in cartStore.items" :key="item.productId" class="table-row" :class="{ 'is-invalid': item.status === 0 }">
          <div class="col-check">
            <el-checkbox :model-value="item.checked" :disabled="checkout.locked.value" @change="async (v) => { try { await cartStore.toggleCheck(item.productId, v) } catch { ElMessage.error('更新失败') } }" />
          </div>
          <div class="col-img" @click="$router.push(`/product/${item.productId}`)">
            <div class="thumb">
              <el-image v-if="item.mainImage" :src="item.mainImage" fit="cover">
                <template #error><el-icon :size="20" color="#c7c7cc"><PictureFilled /></el-icon></template>
              </el-image>
              <el-icon v-else :size="20" color="#c7c7cc"><PictureFilled /></el-icon>
            </div>
          </div>
          <div class="col-name" @click="$router.push(`/product/${item.productId}`)">
            <p class="item-name">{{ item.name }}<span v-if="item.status === 0" class="invalid-tag">已失效</span></p>
          </div>
          <div class="col-price">
            <span class="item-price">¥{{ formatAmount(item.price) }}</span>
          </div>
          <div class="col-qty">
            <el-input-number
              :model-value="item.quantity"
              :min="1"
              :max="item.stock != null ? Math.max(1, Math.min(item.stock, 999)) : 99"
              size="small"
              controls-position="right"
              :disabled="updatingQty.has(item.productId) || checkout.locked.value || item.status === 0"
              @update:model-value="(v) => queueQuantityUpdate(item.productId, v)"
            />
          </div>
          <div class="col-total">
            <span class="item-total">¥{{ formatAmount(item.price * item.quantity) }}</span>
          </div>
          <div class="col-del">
            <el-button link type="danger" :disabled="checkout.locked.value" @click="async () => { try { await cartStore.remove(item.productId) } catch { ElMessage.error('删除失败') } }">
              <el-icon :size="16"><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="cart-footer card">
        <div class="footer-left">
          <el-checkbox v-model="checkAll" :disabled="checkout.locked.value" :indeterminate="indeterminate" @change="toggleAll">全选</el-checkbox>
          <button class="clear-link" :disabled="checkout.locked.value" @click="ElMessageBox.confirm('确定清空购物车？', '提示', { type: 'warning' }).then(async () => { await cartStore.clear() }).catch(() => {})">清空购物车</button>
        </div>
        <div class="footer-right">
          <span class="total-label">
            已选 <strong>{{ cartStore.checkedCount }}</strong> 件，合计
          </span>
          <span class="total-price">¥{{ formatAmount(cartStore.totalPrice) }}</span>
          <button class="btn btn-danger btn-lg" :disabled="!checkoutReady || cartStore.checkedCount === 0 || updatingQty.size > 0" @click="openCheckout">
            去结算
          </button>
        </div>
      </div>
    </template>
      <!-- Checkout Dialog -->
      <el-dialog v-model="dialogVisible" title="确认下单" width="min(560px, calc(100vw - 32px))" :close-on-click-modal="false" class="checkout-dialog">
        <div class="dialog-body">
          <div class="block">
            <h4>收货地址</h4>
            <el-select v-model="selectedAddressId" placeholder="请选择收货地址" style="width:100%" :disabled="addresses.length === 0 || checkout.locked.value">
              <el-option
                v-for="a in addresses"
                :key="a.id"
                :label="`${a.receiverName}  ${a.phone}  ${a.province}${a.city}${a.district}${a.detail}`"
                :value="a.id"
              />
            </el-select>
            <p v-if="addresses.length === 0" class="no-addr">
              暂无收货地址，请先去
              <a href="javascript:void(0)" @click="$router.push('/user/address');dialogVisible=false" style="color: #0071e3; font-weight: 500;">添加地址</a>
            </p>
          </div>

          <div class="block">
            <h4>商品清单</h4>
            <div class="order-items-list">
              <div v-for="item in checkoutItems" :key="item.productId" class="order-item">
                <span class="order-item-name">{{ item.name }} ×{{ item.quantity }}</span>
                <span class="order-item-price">¥{{ formatAmount(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>

          <div class="block">
            <h4>订单备注</h4>
            <el-input v-model="remark" placeholder="选填（如有特殊要求请备注）" type="textarea" :rows="2" resize="none" :disabled="checkout.locked.value" />
          </div>

          <div class="dialog-total">
            <span>合计</span>
            <strong>¥{{ formatAmount(checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)) }}</strong>
          </div>
        </div>
        <template #footer>
          <el-button @click="dialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="submitOrder" :loading="submitting || checkout.busy.value" :disabled="!checkoutReady || (!checkout.locked.value && !selectedAddressId)" size="large">
            {{ checkout.locked.value ? (checkout.status.value === 'READY' ? '重试原请求' : '查询下单结果') : '提交订单' }}
          </el-button>
        </template>
      </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { useCheckoutRequest } from '@/composables/useCheckoutRequest'
import { getAddressList } from '@/api/user'
import { formatAmount } from '@/utils/format'
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
const checkoutReady = ref(false)
const checkout = useCheckoutRequest(useUserStore(), async orderId => {
  ElMessage.success('下单成功')
  dialogVisible.value = false
  await router.push(`/order/${orderId}`)
})
const updatingQty = ref(new Set())

const checkAll = computed({
  get: () => cartStore.items.length > 0 && cartStore.items.every(i => i.checked),
  set: () => {}
})
const indeterminate = computed(() => cartStore.items.some(i => i.checked) && !checkAll.value)
// 失效商品不计入勾选集合与合计，避免"看得见的下单内容"与后端取的勾选集合不一致
const checkedItems = computed(() => cartStore.items.filter(i => i.checked && i.status !== 0))
const checkoutItems = computed(() =>
  checkout.pending.value?.submitted && checkout.pending.value.items
    ? checkout.pending.value.items
    : checkedItems.value
)

onMounted(async () => {
  try {
    await checkout.initialize()
    checkoutReady.value = true
    if (checkout.locked.value) {
      selectedAddressId.value = checkout.pending.value.addressId
      remark.value = checkout.pending.value.remark
      await loadAddresses()
      dialogVisible.value = true
    }
    await cartStore.fetchCart()
  } catch (error) {
    ElMessage.error(error.message || '加载失败，请刷新重试')
  } finally {
    loading.value = false
  }

  // 处理"立即购买"逻辑：只勾选指定商品
  const buyNowProductId = sessionStorage.getItem('buyNowProductId')
  if (buyNowProductId && !checkout.locked.value) {
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
  if (checkout.locked.value) return
  try {
    await cartStore.checkAll(v)
  } catch {
    ElMessage.error("更新失败")
  }
}

async function loadAddresses() {
  try {
    const res = await getAddressList()
    addresses.value = res.data || []
    const savedAddressId = checkout.pending.value?.addressId
    if (!addresses.value.some(a => a.id === selectedAddressId.value)) {
      const defAddr = addresses.value.find(a => a.isDefault === 1)
      selectedAddressId.value = defAddr ? defAddr.id : (addresses.value[0]?.id || null)
      // 已提交请求里的原地址不存在了（如在他端被删除）：回退到未提交状态，
      // 否则弹窗显示的是默认地址，而实际提交的是已失效的原地址。
      if (savedAddressId != null && selectedAddressId.value !== savedAddressId && checkout.pending.value?.submitted) {
        try {
          checkout.save({ ...checkout.pending.value, submitted: false, addressId: selectedAddressId.value })
        } catch {
          // 回退失败时保持原状态，用户可在弹窗中看到仍以原地址提交
        }
        ElMessage.warning('原收货地址已不可用，请重新确认订单信息')
      }
    }
  } catch {
    // 拦截器已提示错误原因，此处静默处理避免重复 toast
    addresses.value = []
  }
}

async function openCheckout() {
  if (!checkoutReady.value || submitting.value || checkout.busy.value) return
  // 以服务器最新勾选为准再弹窗，保证所见即所付
  const cartOk = await cartStore.fetchCart()
  if (!cartOk) {
    // 拦截器已提示原因，此处静默返回避免重复 toast
    return
  }
  if (checkout.locked.value) {
    await loadAddresses()
    dialogVisible.value = true
    await checkout.refresh()
    return
  }
  await loadAddresses()
  try {
    await checkout.prepare()
  } catch {
    ElMessage.error('获取下单令牌失败')
    return
  }
  dialogVisible.value = true
}

async function submitOrder() {
  if (submitting.value || !checkoutReady.value) return
  submitting.value = true
  try {
    await checkout.submit(selectedAddressId.value, remark.value, checkoutItems.value)
  } catch (error) {
    ElMessage.error(error.message || '暂时无法提交，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Checkout recovery banner + actions under the page header */
.page-container > .el-alert { margin-bottom: 12px; }
.page-container > .el-button { margin-bottom: 20px; }

/* Table */
.cart-table {
  overflow: hidden;
  margin-bottom: 20px;
  padding: 4px 8px;
}

.table-head {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: .02em;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border-light);
  border-radius: 12px;
  transition: background var(--transition-fast);
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(0,0,0,.02); }
.table-row.is-invalid { opacity: .45; }
.table-row.is-invalid:hover { background: none; }
.invalid-tag {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.col-check { width: 44px; display: flex; align-items: center; }
.col-img { width: 100px; cursor: pointer; }
.col-name { flex: 1; min-width: 0; padding-right: 14px; cursor: pointer; }
.col-price { width: 110px; text-align: center; }
.col-qty { width: 130px; display: flex; justify-content: center; }
.col-total { width: 120px; text-align: right; }
.col-del { width: 48px; text-align: right; }

.thumb {
  width: 80px; height: 80px;
  border-radius: 14px;
  background: var(--bg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb .el-image { width: 100%; height: 100%; }

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -.015em;
  transition: color var(--transition-fast);
}
.col-name:hover .item-name { color: var(--primary); }
.item-price { font-size: 14px; color: var(--text-secondary); }
.item-total { font-size: 16px; font-weight: 600; color: var(--text); }

/* Footer: frosted bar that sticks to the bottom while scrolling */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 14px 24px;
  position: sticky;
  bottom: 20px;
  background: var(--glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.clear-link {
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: color var(--transition-fast);
}
.clear-link:hover:not(:disabled) { color: var(--danger); }
.clear-link:disabled { opacity: .4; cursor: not-allowed; }

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
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
  font-weight: 600;
  color: var(--text);
  letter-spacing: -.02em;
}
.footer-right .btn-danger { background: var(--primary); }
.footer-right .btn-danger:hover:not(:disabled) { background: var(--primary-hover); }

/* Dialog content */
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.block h4 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: .01em;
}

.no-addr {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 10px;
  padding: 12px 16px;
  background: var(--bg);
  border-radius: 12px;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-radius: 14px;
  padding: 4px 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
  border-bottom: 1px solid var(--border-light);
}
.order-item:last-child { border-bottom: none; }

.order-item-name {
  flex: 1;
  font-weight: 500;
  color: var(--text);
}

.order-item-price {
  font-weight: 500;
  color: var(--text);
  font-size: 14px;
}

.dialog-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 15px;
  color: var(--text-secondary);
  padding-top: 18px;
  border-top: 1px solid var(--border-light);
}

.dialog-total strong {
  font-size: 28px;
  color: var(--text);
  font-weight: 600;
  letter-spacing: -.02em;
}

@media (max-width: 768px) {
  .table-head, .table-row { padding: 12px 8px; font-size: 12px; }
  .col-price, .col-total { display: none; }
  .cart-footer { flex-direction: column; gap: 12px; border-radius: var(--radius-lg); padding: 16px; }
}
</style>
