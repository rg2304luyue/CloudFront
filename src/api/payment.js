import request from '@/utils/request'

/** 查询支付记录 */
export function getPaymentByOrderNo(orderNo) {
  return request.get(`/payment/${orderNo}`)
}

/** 发起支付宝页面支付，返回支付表单 HTML */
export function createAlipayPayment(orderNo) {
  return request.post(`/payment/alipay`, { orderNo, method: 'ALIPAY' })
}
