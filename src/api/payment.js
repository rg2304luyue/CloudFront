import request from '@/utils/request'

export function getPaymentByOrderNo(orderNo) {
  return request.get(`/payment/${orderNo}`)
}
