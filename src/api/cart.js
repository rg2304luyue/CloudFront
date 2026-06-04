import request from '@/utils/request'

export function getCartList() {
  return request.get('/cart')
}

export function getCheckedItems() {
  return request.get('/cart/checked')
}

export function addToCart(productId, quantity = 1) {
  return request.post('/cart/items', { productId, quantity })
}

export function updateQuantity(productId, quantity) {
  return request.patch(`/cart/items/${productId}`, { quantity })
}

export function checkItem(productId, checked) {
  return request.patch(`/cart/items/${productId}/check`, { checked })
}

export function checkAllItems(checked) {
  return request.patch('/cart/items/check-all', { checked })
}

export function removeFromCart(productId) {
  return request.delete(`/cart/items/${productId}`)
}

export function clearCart() {
  return request.delete('/cart/items')
}
