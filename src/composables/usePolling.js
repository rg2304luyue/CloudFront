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

  function start() {
    stop()
    timer.value = setInterval(pollFn, interval)
  }

  function stop() {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stop()
    } else {
      pollFn()
      start()
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
