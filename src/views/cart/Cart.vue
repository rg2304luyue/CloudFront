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
            <div class="thumb"><el-image v-if="item.productImage" :src="item.productImage" fit="cover"><template #error><el-icon :size="22" color="#d1d5db"><PictureFilled /></el-icon></template></el-image><el-icon v-else :size="22" color="#d1d5db"><PictureFilled /></el-icon></div>
          </div>
          <div class="col-name"><p class="item-name">{{ item.productName }}</p></div>
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
          <button class="checkout-btn" :disabled="cartStore.totalCount === 0" @click="checkout">去结算</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter(); const cartStore = useCartStore(); const loading = ref(true)
const checkAll = computed({ get: () => cartStore.items.length > 0 && cartStore.items.every(i => i.checked), set: () => {} })
const indeterminate = computed(() => cartStore.items.some(i => i.checked) && !checkAll.value)

onMounted(async () => { await cartStore.fetchCart(); loading.value = false })

function toggleAll(v) { cartStore.items.forEach(i => { if (i.checked !== v) cartStore.toggleCheck(i.productId, v) }) }
function checkout() { router.push('/order/list') }
</script>

<style scoped>
.cart-table { background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border); overflow: hidden; }
.table-header { display: flex; align-items: center; padding: 12px 20px; background: #f9fafb; border-bottom: 1px solid var(--border); font-size: 12px; color: var(--text-muted); }
.table-row { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); transition: background .1s; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #fafbfc; }
.col-check { width: 40px; }
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
</style>
