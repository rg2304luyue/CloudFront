import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCartList, addToCart, updateQuantity, checkItem,
  removeFromCart, clearCart, getCheckedItems
} from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const checkedCount = computed(() => items.value.filter(i => i.checked).length)
  const totalPrice = computed(() =>
    items.value
      .filter(i => i.checked)
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
  )

  async function fetchCart() {
    try {
      const res = await getCartList()
      items.value = res.data || []
    } catch {
      items.value = []
    }
  }

  async function add(productId, quantity = 1) {
    await addToCart(productId, quantity)
    await fetchCart()
  }

  async function updateQty(productId, quantity) {
    await updateQuantity(productId, quantity)
    await fetchCart()
  }

  async function toggleCheck(productId, checked) {
    await checkItem(productId, checked)
    await fetchCart()
  }

  async function remove(productId) {
    await removeFromCart(productId)
    await fetchCart()
  }

  async function clear() {
    await clearCart()
    items.value = []
  }

  return { items, checkedCount, totalPrice, fetchCart, add, updateQty, toggleCheck, remove, clear }
})
