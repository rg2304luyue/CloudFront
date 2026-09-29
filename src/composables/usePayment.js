import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createAlipayPayment } from '@/api/payment'

const payingOrders = reactive(new Set())
const ALIPAY_HOSTS = new Set(['openapi.alipay.com', 'openapi-sandbox.dl.alipaydev.com'])
const PAYMENT_LOCK_TIMEOUT = 30 * 60 * 1000

function showLoadingPage(paymentWindow) {
  paymentWindow.opener = null
  paymentWindow.document.title = '正在准备支付'
  paymentWindow.document.body.textContent = '正在准备支付页面…'
  paymentWindow.document.body.style.cssText = 'text-align:center;padding:60px 20px;font-family:sans-serif;color:#666;'
}

function submitTrustedAlipayForm(paymentWindow, html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const forms = parsed.querySelectorAll('form')
  if (forms.length !== 1) throw new Error('支付表单格式异常')

  const sourceForm = forms[0]
  const action = new URL(sourceForm.getAttribute('action'))
  const method = (sourceForm.getAttribute('method') || '').toUpperCase()
  if (action.protocol !== 'https:' || !ALIPAY_HOSTS.has(action.hostname)
      || action.port || action.pathname !== '/gateway.do' || method !== 'POST') {
    throw new Error('支付地址不受信任')
  }

  const fields = new Map()
  for (const input of sourceForm.querySelectorAll('input[type="hidden"][name]')) {
    if (fields.has(input.name)) throw new Error('支付字段重复')
    fields.set(input.name, input.value)
  }
  for (const required of ['app_id', 'method', 'sign']) {
    if (!action.searchParams.get(required)) throw new Error('支付地址缺少必要参数')
  }
  if (!fields.get('biz_content')) throw new Error('支付表单缺少必要字段')

  const doc = paymentWindow.document
  doc.body.replaceChildren()
  const form = doc.createElement('form')
  form.method = 'POST'
  form.action = action.href
  for (const [name, value] of fields) {
    const input = doc.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  doc.body.appendChild(form)
  form.submit()
}

function releaseLockWhenWindowCloses(paymentKey, paymentWindow) {
  const timer = window.setInterval(() => {
    if (paymentWindow.closed) {
      window.clearInterval(timer)
      window.clearTimeout(timeout)
      payingOrders.delete(paymentKey)
    }
  }, 500)
  const timeout = window.setTimeout(() => {
    window.clearInterval(timer)
    payingOrders.delete(paymentKey)
  }, PAYMENT_LOCK_TIMEOUT)
}

/** 支付宝支付处理：先同步打开窗口（避免浏览器拦截），确认后再加载支付表单 */
export function usePayment() {
  async function handlePay(orderNo) {
    const paymentKey = String(orderNo)
    if (payingOrders.has(paymentKey)) {
      ElMessage.warning('该订单正在准备支付，请勿重复操作')
      return
    }
    payingOrders.add(paymentKey)

    // 在用户点击的同步上下文中打开窗口，避免浏览器拦截弹窗
    const w = window.open('', '_blank')
    if (!w) {
      payingOrders.delete(paymentKey)
      ElMessage.error('支付页面被浏览器拦截，请允许弹出窗口后重试')
      return
    }
    showLoadingPage(w)

    let submitted = false
    try {
      await ElMessageBox.confirm('即将跳转到支付宝进行支付', '确认支付', {
        confirmButtonText: '去支付',
        cancelButtonText: '取消',
        type: 'info'
      })
      const res = await createAlipayPayment(orderNo)
      if (!res.data) throw new Error('支付表单为空')
      submitTrustedAlipayForm(w, res.data)
      submitted = true
      releaseLockWhenWindowCloses(paymentKey, w)
    } catch (error) {
      if (['cancel', 'close'].includes(error)) {
        // 用户取消，静默
      } else if (error?.code || error?.response || error?.request) {
        // 业务/HTTP/网络错误已由 request.js 拦截器提示具体原因，避免重复 toast
      } else {
        // 本地校验错误（支付表单/地址不受信任等），补充提示
        ElMessage.error(error?.message || '获取支付信息失败')
      }
    } finally {
      if (!submitted && !w.closed) w.close()
      if (!submitted) payingOrders.delete(paymentKey)
    }
  }

  const isPaying = (orderNo) => payingOrders.has(String(orderNo))
  return { handlePay, isPaying }
}
