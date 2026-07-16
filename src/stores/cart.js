import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCartList, addToCart, updateQuantity, checkItem,
  removeFromCart, clearCart, getCheckedItems, checkAllItems
} from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const checkedCount = computed(() => items.value.filter(i => i.checked).length)
  const totalPrice = computed(() =>
    Math.round(items.value.filter(i => i.checked).reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100
  )

  async function fetchCart() {
    try {
      const res = await getCartList()
      items.value = res.data || []
    } catch (e) {
      // Only clear on auth failure (401), preserve items on network errors
      if (e?.response?.status === 401 || e?.message?.includes("401")) {
        items.value = []
      }
      // Other errors: keep existing items, let the interceptor show the error toast
    }
  }

  async function add(productId, quantity = 1) {
    await addToCart(productId, quantity)
    await fetchCart()
  }

  async function updateQty(productId, quantity, rollbackQuantity) {
    // 乐观更新
    const item = items.value.find(i => i.productId === productId)
    if (!item) return
    const oldQty = rollbackQuantity ?? item.quantity
    item.quantity = quantity
    try {
      await updateQuantity(productId, quantity)
    } catch {
      if (item.quantity === quantity) {
        item.quantity = oldQty
      }
      throw new Error('更新失败')
    }
  }

  async function toggleCheck(productId, checked) {
    // 乐观更新
    const item = items.value.find(i => i.productId === productId)
    if (!item) return
    const oldChecked = item.checked
    item.checked = checked
    try {
      await checkItem(productId, checked)
    } catch {
      item.checked = oldChecked
      throw new Error('更新失败')
    }
  }

  async function checkAll(checked) {
    // 乐观更新
    const oldStates = items.value.map(i => ({ id: i.productId, checked: i.checked }))
    items.value.forEach(i => { i.checked = checked })
    try {
      await checkAllItems(checked)
    } catch {
      // 回滚
      oldStates.forEach(old => {
        const item = items.value.find(i => i.productId === old.id)
        if (item) item.checked = old.checked
      })
      throw new Error('更新失败')
    }
  }

  async function remove(productId) {
    // 乐观更新
    const index = items.value.findIndex(i => i.productId === productId)
    if (index === -1) return
    const removedItem = items.value.splice(index, 1)[0]
    try {
      await removeFromCart(productId)
    } catch {
      // 回滚
      items.value.splice(index, 0, removedItem)
      throw new Error('删除失败')
    }
  }

  async function clear() {
    await clearCart()
    items.value = []
  }

  /** 本地重置（不调 API，登出时使用） */
  function reset() {
    items.value = []
  }

  return { items, checkedCount, totalPrice, fetchCart, add, updateQty, toggleCheck, checkAll, remove, clear, reset }
})
