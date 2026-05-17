import request from '@/utils/request'

export function createOrder(addressId, remark) {
  return request.post('/order/create', null, { params: { addressId, remark } })
}

export function getOrderDetail(id) {
  return request.get(`/order/detail/${id}`)
}

export function getOrderList(params) {
  return request.get('/order/list', { params })
}

export function cancelOrder(id) {
  return request.put(`/order/cancel/${id}`)
}
