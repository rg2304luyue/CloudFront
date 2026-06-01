import { ElMessageBox } from 'element-plus'
import { createAlipayPayment } from '@/api/payment'

/** 支付宝支付处理：确认后打开新窗口渲染支付表单 */
export function usePayment() {
  function handlePay(orderNo) {
    ElMessageBox.confirm('即将跳转到支付宝进行支付', '确认支付', {
      confirmButtonText: '去支付',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      const res = await createAlipayPayment(orderNo)
      const payForm = res.data
      if (payForm) {
        const w = window.open('', '_blank')
        w.document.write(payForm)
        w.document.close()
      }
    }).catch(() => {})
  }

  return { handlePay }
}
