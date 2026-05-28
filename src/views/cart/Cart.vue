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
            <el-checkbox :model-value="item.checked" @change="(v) => cartStore.toggleCheck(item.productId, v)" />
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
              v-model="item.quantity"
              :min="1"
              :max="99"
              size="small"
              controls-position="right"
              @change="(v) => cartStore.updateQty(item.productId, v)"
            />
          </div>
          <div class="col-total">
            <span class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="col-del">
            <el-button link type="danger" @click="cartStore.remove(item.productId)">
              <el-icon :size="16"><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="cart-footer card">
        <div class="footer-left">
          <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="toggleAll">全选</el-checkbox>
          <button class="clear-link" @click="cartStore.clear()">清空购物车</button>
        </div>
        <div class="footer-right">
          <span class="total-label">
            已选 <strong>{{ cartStore.totalCount }}</strong> 件，合计
          </span>
          <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          <button class="btn btn-danger btn-lg" :disabled="cartStore.totalCount === 0" @click="openCheckout">
            去结算
          </button>
        </div>
      </div>

      <!-- Checkout Dialog -->
      <el-dialog v-model="dialogVisible" title="确认下单" width="520px" :close-on-click-modal="false" class="checkout-dialog">
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
              <a href="javascript:void(0)" @click="$router.push('/user/address');dialogVisible=false" style="color:var(--primary)">添加地址</a>
            </p>
          </div>

          <div class="block">
            <h4>商品清单</h4>
            <div v-for="item in checkedItems" :key="item.productId" class="order-item">
              <span class="order-item-name">{{ item.name }} ×{{ item.quantity }}</span>
              <span class="order-item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="block">
            <h4>备注</h4>
            <el-input v-model="remark" placeholder="选填（如有特殊要求请备注）" />
          </div>

          <div class="dialog-total">
            <span>合计</span>
            <strong>¥{{ cartStore.totalPrice.toFixed(2) }}</strong>
          </div>
        </div>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="danger" @click="submitOrder" :loading="submitting" :disabled="!selectedAddressId">
            提交订单
          </el-button>
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
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(true)
const dialogVisible = ref(false)
const submitting = ref(false)
const addresses = ref([])
const selectedAddressId = ref(null)
const remark = ref('')

const checkAll = computed({
  get: () => cartStore.items.length > 0 && cartStore.items.every(i => i.checked),
  set: () => {}
})
const indeterminate = computed(() => cartStore.items.some(i => i.checked) && !checkAll.value)
const checkedItems = computed(() => cartStore.items.filter(i => i.checked))

onMounted(async () => {
  await cartStore.fetchCart()
  loading.value = false
})

function toggleAll(v) {
  cartStore.items.forEach(i => {
    if (i.checked !== v) cartStore.toggleCheck(i.productId, v)
  })
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
  dialogVisible.value = true
}

async function submitOrder() {
  submitting.value = true
  try {
    const res = await createOrder(selectedAddressId.value, remark.value)
    ElMessage.success('下单成功')
    dialogVisible.value = false
    const orderId = res.data?.id
    router.push(orderId ? `/order/${orderId}` : '/order/list')
  } catch {} finally {
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
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.block h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.no-addr {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
}
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-light);
}
.order-item:last-child { border-bottom: none; }
.order-item-name { flex: 1; }
.order-item-price { font-weight: 500; color: var(--text); }
.dialog-total {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 10px;
  font-size: 15px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}
.dialog-total strong {
  font-size: 22px;
  color: var(--danger);
  font-weight: 800;
}

@media (max-width: 768px) {
  .table-head, .table-row { padding: 12px 12px; font-size: 12px; }
  .col-price, .col-total { display: none; }
  .cart-footer { flex-direction: column; gap: 12px; }
}
</style>
