import request from '@/utils/request'

export function createOrder(addressId, remark, orderToken) {
  return request.post('/orders', { addressId, remark, orderToken })
}

export function getOrderDetail(id) {
  return request.get(`/orders/${id}`)
}

export function getOrderByNo(orderNo) {
  return request.get(`/orders/by-no/${encodeURIComponent(orderNo)}`)
}

export function getOrderList(params) {
  return request.get('/orders', { params })
}

export function cancelOrder(id) {
  return request.patch(`/orders/${id}/cancel`)
}

// ===== 卖家订单 =====

export function getSellerOrders(params) {
  return request.get('/seller/orders', { params })
}

export function shipOrder(id) {
  return request.patch(`/seller/orders/${id}/ship`)
}

export function receiveOrder(id) {
  return request.patch(`/orders/${id}/receive`)
}

export function getOrderToken() {
  return request.get('/orders/token')
}

// ===== 管理员 Outbox =====

export function getFailedOutboxMessages(limit = 50) {
  return request.get('/orders/admin/outbox/failed', { params: { limit } })
}

export function retryFailedOutboxMessage(id) {
  return request.post(`/orders/admin/outbox/${id}/retry`)
}
