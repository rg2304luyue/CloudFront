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
