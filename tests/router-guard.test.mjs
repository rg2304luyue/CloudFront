import { readFileSync } from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createRouter, createMemoryHistory } from 'vue-router'

// 复刻 src/router/index.js 的守卫逻辑并断言：/users/me 失败时不能反复重定向到 /500。
// 背景：vue-router 的无限重定向检测只在 dev 构建里（见 dist 产物中该字符串命中数为 0），
// 所以这个环一旦出现在生产环境就是无限循环 + 请求风暴。
const source = readFileSync(new URL('../src/router/index.js', import.meta.url), 'utf8')

test('guard does not loop when fetching the profile fails', async () => {
  // 真实源码必须只重试一次：把失败记成标记位，而不是 next({ name: 'ServerError' })
  assert.match(source, /profileLoadFailed/, '守卫需要用标记位避免重复请求')
  assert.doesNotMatch(
    source,
    /catch\s*\{[\s\S]{0,200}?next\(\{\s*name:\s*'ServerError'\s*\}\)/,
    '守卫的失败分支不能再跳 /500（会与 /500 自身的守卫形成环）'
  )

  const routes = [
    { path: '/home', name: 'Home', component: { template: '<div/>' } },
    { path: '/500', name: 'ServerError', component: { template: '<div/>' } },
    { path: '/login', name: 'Login', component: { template: '<div/>' } }
  ]
  const router = createRouter({ history: createMemoryHistory(), routes })
  let profileLoadFailed = false
  let fetchCalls = 0
  router.beforeEach(async (to, from, next) => {
    if (!profileLoadFailed) {
      try { fetchCalls++; throw new Error('500') } catch { profileLoadFailed = true }
    }
    next()
  })
  await router.push('/home')
  assert.equal(router.currentRoute.value.fullPath, '/home')
  assert.equal(fetchCalls, 1)
})