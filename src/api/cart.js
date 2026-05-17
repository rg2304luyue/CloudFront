import request from '@/utils/request'

export function getCartList() {
  return request.get('/cart/list')
}

export function getCheckedItems() {
  return request.get('/cart/checked')
}

export function addToCart(productId, quantity = 1) {
  return request.post('/cart/add', null, { params: { productId, quantity } })
}

export function updateQuantity(productId, quantity) {
  return request.put('/cart/quantity', null, { params: { productId, quantity } })
}

export function checkItem(productId, checked) {
  return request.put('/cart/check', null, { params: { productId, checked } })
}

export function removeFromCart(productId) {
  return request.delete(`/cart/${productId}`)
}

export function clearCart() {
  return request.delete('/cart/clear')
}
