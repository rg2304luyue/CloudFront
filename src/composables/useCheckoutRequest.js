import { ref, computed, onBeforeUnmount } from 'vue'
import { createOrder, getOrderToken, getOrderRequest } from '@/api/order'

// An unknown response is never permission to generate a different checkout request.
export function useCheckoutRequest(userStore, onSuccess) {
  const pending = ref(null)
  const status = ref('')
  const message = ref('')
  const busy = ref(false)
  const locked = computed(() => !!pending.value?.submitted)
  let storageKey
  let ownerId
  let timer
  let attempts = 0
  let disposed = false
  const active = () => !disposed && String(userStore.userInfo?.id) === ownerId
  const stop = () => { clearTimeout(timer); timer = undefined }

  async function initialize() {
    if (!userStore.userInfo?.id) await userStore.fetchUserInfo()
    if (!userStore.userInfo?.id) throw new Error('无法确认当前用户，请重新登录')
    ownerId = String(userStore.userInfo.id)
    storageKey = `cloud-checkout:${ownerId}`
    const saved = sessionStorage.getItem(storageKey)
    if (saved) {
      // Do not silently discard malformed recovery data and create another order.
      const value = JSON.parse(saved)
      if (typeof value?.token !== 'string' || !value.token || typeof value.submitted !== 'boolean') throw new Error('下单恢复记录异常，请先在订单列表核实结果')
      pending.value = value
    }
    if (pending.value?.submitted) await refresh()
  }

  function save(value) {
    sessionStorage.setItem(storageKey, JSON.stringify(value))
    pending.value = JSON.parse(JSON.stringify(value))
  }

  function clear() {
    sessionStorage.removeItem(storageKey)
    pending.value = null
    stop()
  }

  async function prepare() {
    if (!storageKey) await initialize()
    if (!active()) return
    if (pending.value) {
      if (pending.value.submitted) await refresh()
      return
    }
    const result = await getOrderToken()
    if (!active()) return
    if (typeof result.data !== 'string' || !result.data) throw new Error('下单令牌无效，请稍后重试')
    save({ token: result.data, submitted: false })
    status.value = 'READY'
  }

  async function finish(orderId) {
    if (!orderId) throw new Error('订单结果缺少编号，请继续查询')
    clear()
    status.value = 'SUCCEEDED'
    await onSuccess(String(orderId))
  }

  async function refresh() {
    if (!active() || !pending.value || busy.value) return
    stop()
    busy.value = true
    attempts = 0
    await poll()
  }

  async function poll() {
    if (!active() || !pending.value) { busy.value = false; return }
    attempts++
    try {
      const result = await getOrderRequest(pending.value.token)
      if (!active()) return
      status.value = result.data.status
      message.value = result.data.message || '正在确认下单结果，请勿重复结算'
      if (status.value === 'SUCCEEDED') {
        await finish(result.data.orderId)
        return
      }
      if (['FAILED', 'EXPIRED'].includes(status.value)) {
        clear()
        return
      }
      if (status.value === 'READY') {
        // The status endpoint only reports READY after acquiring the request row.
        // Therefore no preparation or stock operation is still in flight and the
        // user can safely correct the checkout data while retaining the same token.
        save({ token: pending.value.token, submitted: false })
        message.value = '本次请求尚未扣减库存，请修正信息后使用原请求重新提交。'
        return
      }
    } catch {
      if (!active()) return
      status.value = 'UNKNOWN'
      message.value = '暂时无法确认下单结果，请继续查询，不要重新结算。'
    } finally {
      busy.value = false
    }
    if (active() && pending.value && attempts < 20) {
      timer = setTimeout(() => { busy.value = true; void poll() }, 2000)
    }
  }

  async function submit(addressId, remark, items) {
    if (busy.value || !active()) return
    if (locked.value && status.value !== 'READY') { await refresh(); return }
    await prepare()
    if (!active() || !pending.value || (locked.value && status.value !== 'READY')) return
    if (pending.value.submitted && !pending.value.addressId) throw new Error('缺少原请求地址，请先在订单列表核实结果')
    // Persist before POST. If storage fails, no order is sent.
    if (!pending.value.submitted) save({ ...pending.value, submitted: true, addressId, remark, items })
    busy.value = true
    stop()
    status.value = 'PROCESSING'
    message.value = '正在提交并确认下单结果，请勿重复结算'
    try {
      const p = pending.value
      const result = await createOrder(p.addressId, p.remark, p.token)
      if (active()) await finish(result.data?.id)
    } catch (error) {
      if (active()) {
        if (error.code === 42201) {
          // Server explicitly rejected validation before any stock operation.
          save({ token: pending.value.token, submitted: false })
          status.value = 'READY'
          message.value = error.message || '请修正下单信息后重试'
          return
        }
        busy.value = false
        await refresh()
      }
    } finally {
      busy.value = false
    }
  }

  onBeforeUnmount(() => { disposed = true; stop() })
  return { pending, status, message, busy, locked, initialize, prepare, submit, refresh }
}
