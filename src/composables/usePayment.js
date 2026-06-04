import { ElMessageBox } from 'element-plus'
import { createAlipayPayment } from '@/api/payment'

import { ElMessage } from 'element-plus'

/** 支付宝支付处理：先同步打开窗口（避免浏览器拦截），确认后再加载支付表单 */
export function usePayment() {
  function handlePay(orderNo) {
    // 在用户点击的同步上下文中打开窗口，避免浏览器拦截弹窗
    const w = window.open('', '_blank')
    if (!w) {
      ElMessage.error('支付页面被浏览器拦截，请允许弹出窗口后重试')
      return
    }
    w.document.write('<div style="text-align:center;padding:60px 20px;font-family:sans-serif;"><p style="color:#666;">正在准备支付页面…</p></div>')
    w.document.close()

    ElMessageBox.confirm('即将跳转到支付宝进行支付', '确认支付', {
      confirmButtonText: '去支付',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      try {
        const res = await createAlipayPayment(orderNo)
        const payForm = res.data
        if (payForm) {
          w.document.write(payForm)
          w.document.close()
        } else {
          w.close()
          ElMessage.error('获取支付信息失败')
        }
      } catch {
        w.close()
        ElMessage.error('获取支付信息失败')
      }
    }).catch(() => {
      w.close()
    })
  }

  return { handlePay }
}
