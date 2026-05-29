import request from '@/utils/request'

export function createOrder(addressId, remark) {
  return request.post('/orders', { addressId, remark })
}

export function getOrderDetail(id) {
  return request.get(`/orders/${id}`)
}

export function getOrderList(params) {
  return request.get('/orders', { params })
}

export function cancelOrder(id) {
  return request.post(`/orders/${id}/cancel`)
}

// ===== 卖家订单 =====

export function getSellerOrders(params) {
  return request.get('/seller/orders', { params })
}

export function shipOrder(id) {
  return request.put(`/seller/orders/${id}/ship`)
}

export function receiveOrder(id) {
  return request.post(`/orders/${id}/receive`)
}