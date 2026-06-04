import { ref } from 'vue'

/**
 * 分页逻辑组合式函数
 * @param {Function} fetchFn - 获取数据的函数，应返回 { data, total } 格式
 * @param {Object} options - 配置选项
 * @param {number} options.defaultSize - 默认每页数量
 * @param {boolean} options.immediate - 是否立即加载
 * @returns {Object} 分页相关状态和方法
 */
export function usePagination(fetchFn, options = {}) {
  const { defaultSize = 10, immediate = true } = options

  const page = ref(1)
  const size = ref(defaultSize)
  const total = ref(0)
  const list = ref([])
  const loading = ref(false)

  async function fetchData(silent = false) {
    if (!silent) loading.value = true
    try {
      const res = await fetchFn({ page: page.value, size: size.value })
      list.value = res.data || []
      total.value = res.total || 0
    } catch (e) {
      if (!silent) throw e
    } finally {
      if (!silent) loading.value = false
    }
  }

  function onPageChange(newPage) {
    page.value = newPage
    fetchData()
  }

  function reset() {
    page.value = 1
    list.value = []
    total.value = 0
  }

  return {
    page,
    size,
    total,
    list,
    loading,
    fetchData,
    onPageChange,
    reset
  }
}
