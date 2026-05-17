<template>
  <div class="page-container">
    <h3 class="page-title">购物车</h3>
    <LoadingState v-if="loading" />
    <EmptyState
      v-else-if="cartStore.items.length === 0"
      description="购物车是空的"
      show-action
      action-text="去逛逛"
      @action="$router.push('/product/list')"
    />
    <template v-else>
      <!-- 购物车列表 -->
      <div class="cart-list">
        <div v-for="item in cartStore.items" :key="item.productId" class="cart-item">
          <el-checkbox :model-value="item.checked" @change="(val) => cartStore.toggleCheck(item.productId, val)" />
          <el-image :src="item.productImage || ''" fit="cover" class="cart-item-img">
            <template #error><el-icon :size="32"><PictureFilled /></el-icon></template>
          </el-image>
          <div class="cart-item-info">
            <p class="cart-item-name">{{ item.productName }}</p>
            <p class="cart-item-price">¥{{ item.price }}</p>
          </div>
          <el-input-number v-model="item.quantity" :min="1" :max="99" size="small" @change="(v) => cartStore.updateQty(item.productId, v)" />
          <span class="cart-item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          <el-button type="danger" link @click="cartStore.remove(item.productId)">删除</el-button>
        </div>
      </div>

      <!-- 底部结算栏 -->
      <div class="cart-footer">
        <div class="footer-left">
          <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="toggleAll">全选</el-checkbox>
          <el-button link @click="cartStore.clear()">清空购物车</el-button>
        </div>
        <div class="footer-right">
          <span class="total-text">
            已选 <strong>{{ cartStore.totalCount }}</strong> 件，合计
          </span>
          <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          <el-button type="danger" size="large" :disabled="cartStore.totalCount === 0" @click="checkout">去结算</el-button>
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

const router = useRouter()
const cartStore = useCartStore()
const loading = ref(true)

const checkAll = computed({
  get: () => cartStore.items.length > 0 && cartStore.items.every(i => i.checked),
  set: () => {}
})
const indeterminate = computed(() =>
  cartStore.items.some(i => i.checked) && !checkAll.value
)

onMounted(async () => {
  await cartStore.fetchCart()
  loading.value = false
})

function toggleAll(val) {
  cartStore.items.forEach(i => {
    if (i.checked !== val) {
      cartStore.toggleCheck(i.productId, val)
    }
  })
}

function checkout() {
  router.push('/order/list')
}
</script>

<style scoped>
.page-title { font-size: 22px; font-weight: 600; margin-bottom: 20px; }
.cart-list { background: #fff; border-radius: 8px; padding: 0 20px; }
.cart-item { display: flex; align-items: center; gap: 16px; padding: 20px 0; border-bottom: 1px solid #ebeef5; }
.cart-item:last-child { border-bottom: none; }
.cart-item-img { width: 80px; height: 80px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; }
.cart-item-info { flex: 1; }
.cart-item-name { font-size: 14px; font-weight: 500; margin-bottom: 6px; }
.cart-item-price { font-size: 14px; color: #f56c6c; }
.cart-item-total { font-size: 14px; font-weight: bold; color: #f56c6c; min-width: 80px; text-align: right; }
.cart-footer { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 8px; padding: 16px 20px; margin-top: 16px; position: sticky; bottom: 0; }
.footer-left { display: flex; align-items: center; gap: 16px; }
.footer-right { display: flex; align-items: center; gap: 12px; }
.total-text { font-size: 14px; color: #606266; }
.total-price { font-size: 22px; font-weight: bold; color: #f56c6c; }
</style>
