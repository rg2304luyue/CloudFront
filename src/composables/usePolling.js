import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * 通用轮询 composable，含 visibilitychange 自动暂停/恢复
 * @param {Function} pollFn - 轮询回调函数
 * @param {Object} options
 * @param {number} options.interval - 轮询间隔（毫秒），默认 30000
 * @returns {{ start: Function, stop: Function }}
 */
export function usePolling(pollFn, { interval = 30000 } = {}) {
  const timer = ref(null)
  let running = false
  let stopped = true
  let scheduleVersion = 0

  async function run() {
    if (running || stopped) return

    running = true
    try {
      await pollFn()
    } catch {
      // Individual screens own their error state. Keep the polling loop alive.
    } finally {
      running = false
    }
  }

  function schedule() {
    if (stopped) return
    const version = scheduleVersion

    timer.value = setTimeout(async () => {
      if (stopped || version !== scheduleVersion) return
      timer.value = null
      await run()
      if (!stopped && version === scheduleVersion) {
        schedule()
      }
    }, interval)
  }

  function start() {
    stop()
    stopped = false
    scheduleVersion++
    schedule()
  }

  function stop() {
    stopped = true
    scheduleVersion++
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stop()
    } else {
      start()
      void run()
    }
  }

  onMounted(() => {
    start()
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeUnmount(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return { start, stop }
}
