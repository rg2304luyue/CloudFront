<template>
  <div class="home">
    <section class="hero">
      <div class="hero-inner">
        <h1>发现好物，品质生活</h1>
        <p>基于 Spring Cloud Alibaba 的微服务电商平台</p>
        <button class="hero-btn" @click="$router.push('/product/list')">立即选购 <el-icon :size="16"><ArrowRight /></el-icon></button>
      </div>
    </section>

    <section class="page-container">
      <div class="section-head">
        <h2>热门商品</h2>
        <router-link to="/product/list" class="more">查看全部 <el-icon :size="14"><ArrowRight /></el-icon></router-link>
      </div>
      <LoadingState v-if="loading" text="正在加载..." />
      <EmptyState v-else-if="products.length === 0" description="暂无商品" show-action @action="$router.push('/product/list')" />
      <div v-else class="grid">
        <div v-for="p in products" :key="p.id" class="card" @click="$router.push(`/product/${p.id}`)">
          <div class="card-img">
            <el-image v-if="p.mainImage" :src="p.mainImage" fit="cover" class="img-inner"><template #error><el-icon :size="36" color="#d1d5db"><PictureFilled /></el-icon></template></el-image>
            <el-icon v-else :size="36" color="#d1d5db"><PictureFilled /></el-icon>
          </div>
          <div class="card-body">
            <p class="card-name">{{ p.name }}</p>
            <div class="card-bottom">
              <span class="card-price">¥{{ p.price }}</span>
              <span class="card-sales">已售 {{ p.sales || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHotProducts } from '@/api/product'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
const products = ref([]); const loading = ref(true)
onMounted(async () => { try { const r = await getHotProducts(); products.value = r.data || [] } finally { loading.value = false } })
</script>

<style scoped>
.home { padding-bottom: 40px; }

/* Hero */
.hero { background: linear-gradient(155deg, #eef1ff 0%, #e8ecf8 40%, #f0f4ff 100%); padding: 72px 24px; text-align: center; }
.hero h1 { font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.hero p { font-size: 15px; color: var(--text-secondary); margin-bottom: 24px; }
.hero-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 28px; border: none; border-radius: 8px; background: var(--primary); color: #fff; font-size: 15px; cursor: pointer; transition: background .15s; }
.hero-btn:hover { background: var(--primary-dark); }

/* Section */
.section-head { display: flex; align-items: center; justify-content: space-between; margin: 36px 0 20px; }
.section-head h2 { font-size: 18px; font-weight: 600; }
.more { font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
.more:hover { color: var(--primary); }

/* Grid */
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.card { background: var(--bg-card); border-radius: var(--radius); overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: border-color .15s, box-shadow .15s, transform .15s; }
.card:hover { border-color: var(--primary); box-shadow: var(--shadow-md); transform: translateY(-2px); }
.card-img { height: 200px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
.img-inner { width: 100%; height: 100%; }
.card-body { padding: 14px; }
.card-name { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 10px; }
.card-bottom { display: flex; justify-content: space-between; align-items: baseline; }
.card-price { font-size: 18px; font-weight: 700; color: var(--danger); }
.card-sales { font-size: 12px; color: var(--text-muted); }
</style>
