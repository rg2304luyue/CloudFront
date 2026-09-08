import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import assert from 'node:assert/strict'

// Exercise the actual component script with isolated network and lifecycle hooks.
const source = readFileSync(new URL('../src/views/payment/PaymentResult.vue', import.meta.url), 'utf8')
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
function screen(orderStatus) {
  let polls = 0
  let paymentCalls = 0
  let unmount
  const context = vm.createContext({
    ref: value => ({ value }),
    useRoute: () => ({ query: { orderNo: 'test-order' } }),
    onMounted: () => {},
    onBeforeUnmount: fn => { unmount = fn },
    getPaymentByOrderNo: async () => { paymentCalls++; return { data: { status: 1 } } },
    getOrderByNo: async () => {
      if (orderStatus instanceof Error) throw orderStatus
      return { data: { status: orderStatus } }
    },
    ORDER_STATUS: { UNPAID: 0, PAID: 1, SHIPPED: 2, COMPLETED: 3, CANCELLED: 4 },
    setTimeout: () => { polls++; return 1 }, clearTimeout: () => {}
  })
  vm.runInContext(script + '\nglobalThis.state = { checkPayment, resultType, resultTitle, paymentConfirmed };', context)
  return { ...context.state, polls: () => polls, paymentCalls: () => paymentCalls, unmount: () => unmount() }
}

test('cancelled but paid order must not promise fulfillment', async () => {
  const page = screen(4)
  await page.checkPayment()
  assert.equal(page.resultType.value, 'exception')
  assert.match(page.resultTitle.value, /已取消/)
  assert.equal(page.polls(), 0)
})
test('confirmed payment waits for order and does not re-query payment', async () => {
  const page = screen(0)
  await page.checkPayment()
  await page.checkPayment()
  assert.equal(page.resultType.value, 'pending')
  assert.equal(page.paymentConfirmed.value, true)
  assert.equal(page.paymentCalls(), 1)
})
test('paid, shipped and completed orders are successful', async () => {
  for (const status of [1, 2, 3]) {
    const page = screen(status)
    await page.checkPayment()
    assert.equal(page.resultType.value, 'success')
    assert.equal(page.polls(), 0)
  }
})
test('order query failure preserves confirmed payment and stops at poll limit', async () => {
  const page = screen(new Error('offline'))
  for (let i = 0; i < 20; i++) await page.checkPayment()
  assert.equal(page.resultType.value, 'unconfirmed')
  assert.equal(page.paymentConfirmed.value, true)
  assert.match(page.resultTitle.value, /支付已确认/)
  assert.equal(page.polls(), 19)
})
test('unmounted page does not request again', async () => {
  const page = screen(0)
  page.unmount()
  await page.checkPayment()
  assert.equal(page.paymentCalls(), 0)
})
