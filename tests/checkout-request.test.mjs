import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import assert from 'node:assert/strict'

const source = readFileSync(new URL('../src/composables/useCheckoutRequest.js', import.meta.url), 'utf8')
  .replace(/^import .*$/gm, '').replace('export function', 'function')
function fixture({ saved, query = async () => ({ data: { status: 'PROCESSING' } }), post, userId = '1' } = {}) {
  const data = new Map(saved ? [[`cloud-checkout:${userId}`, JSON.stringify(saved)]] : [])
  const calls = { tokens: 0, posts: [], queries: [], success: [] }
  const timers = new Map()
  let unmount
  let sequence = 0
  const user = { userInfo: { id: userId } }
  const context = vm.createContext({
    ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }),
    onBeforeUnmount: fn => { unmount = fn },
    sessionStorage: { getItem: k => data.get(k), setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) },
    setTimeout: fn => { timers.set(++sequence, fn); return sequence }, clearTimeout: id => timers.delete(id),
    getOrderToken: async () => { calls.tokens++; return { data: 'token-1' } },
    getOrderRequest: async token => { calls.queries.push(token); return query() },
    createOrder: async (...args) => { calls.posts.push(args); return post ? post(...args) : { data: { id: '9007199254740993' } } }
  })
  vm.runInContext(source + '\nglobalThis.factory = useCheckoutRequest', context)
  const state = context.factory(user, async id => calls.success.push(id))
  return { state, calls, data, timers, user, unmount: () => unmount(), tick: async () => {
    const [id, fn] = timers.entries().next().value || []
    if (fn) { timers.delete(id); fn(); await new Promise(resolve => setImmediate(resolve)) }
  } }
}
const saved = { token: 'original', submitted: true, addressId: '5', remark: 'original note', items: [{ productId: '8', quantity: 2 }] }

test('successful checkout persists before POST and preserves string order ID', async () => {
  const f = fixture()
  await f.state.initialize()
  await f.state.submit('5', '', [])
  assert.equal(f.calls.posts.length, 1)
  assert.equal(f.calls.success[0], '9007199254740993')
  assert.equal(f.data.size, 0)
})
test('timeout retains original token; processing retries only query', async () => {
  const f = fixture({ post: async () => { throw new Error('timeout') } })
  await f.state.initialize()
  await f.state.submit('5', '', [])
  await f.state.submit('6', 'changed', [])
  assert.equal(f.calls.tokens, 1)
  assert.equal(f.calls.posts.length, 1)
  assert.equal(f.state.locked.value, true)
})
test('READY recovery keeps original token but allows corrected checkout data', async () => {
  const f = fixture({ saved, query: async () => ({ data: { status: 'READY' } }) })
  await f.state.initialize()
  assert.equal(f.calls.posts.length, 0)
  assert.equal(f.state.locked.value, false)
  await f.state.submit('other', 'new', [])
  assert.deepEqual(f.calls.posts[0], ['other', 'new', 'original'])
  assert.equal(f.calls.tokens, 0)
})
test('refresh recovers committed order without submitting', async () => {
  const f = fixture({ saved, query: async () => ({ data: { status: 'SUCCEEDED', orderId: '77' } }) })
  await f.state.initialize()
  assert.deepEqual(f.calls.success, ['77'])
  assert.equal(f.calls.posts.length, 0)
})
test('compensation remains locked and queries instead of replacing token', async () => {
  const f = fixture({ saved, query: async () => ({ data: { status: 'COMPENSATING' } }) })
  await f.state.initialize()
  await f.state.submit('5', '', [])
  assert.equal(f.calls.tokens, 0)
  assert.equal(f.calls.posts.length, 0)
  assert.equal(f.state.locked.value, true)
})
test('only explicit FAILED or EXPIRED releases request for new token', async () => {
  for (const status of ['FAILED', 'EXPIRED']) {
    const f = fixture({ saved, query: async () => ({ data: { status } }) })
    await f.state.initialize()
    assert.equal(f.state.locked.value, false)
    await f.state.prepare()
    assert.equal(f.calls.tokens, 1)
  }
})
test('unknown result stops automatic polling after 20 checks without releasing request', async () => {
  const f = fixture({ saved, query: async () => { throw new Error('offline') } })
  await f.state.initialize()
  for (let i = 0; i < 25; i++) await f.tick()
  assert.equal(f.calls.queries.length, 20)
  assert.equal(f.timers.size, 0)
  assert.equal(f.state.locked.value, true)
})
test('unmount cancels polling and suppresses pending response navigation', async () => {
  let resolve
  const f = fixture({ saved, query: () => new Promise(r => { resolve = r }) })
  const running = f.state.initialize()
  f.unmount()
  resolve({ data: { status: 'SUCCEEDED', orderId: '77' } })
  await running
  assert.equal(f.calls.success.length, 0)
  assert.equal(f.timers.size, 0)
  assert.equal(f.data.size, 1)
})
test('switching users suppresses old result and retains old user recovery data', async () => {
  let resolve
  const f = fixture({ saved, query: () => new Promise(r => { resolve = r }) })
  const running = f.state.initialize()
  f.user.userInfo = { id: '2' }
  resolve({ data: { status: 'SUCCEEDED', orderId: '77' } })
  await running
  assert.equal(f.calls.success.length, 0)
  assert.equal(f.data.has('cloud-checkout:1'), true)
})
test('malformed recovery data blocks checkout rather than discarding evidence', async () => {
  const f = fixture({ saved: { token: '' } })
  await assert.rejects(f.state.initialize(), /恢复记录异常/)
  assert.equal(f.calls.tokens, 0)
  assert.equal(f.data.size, 1)
})
