<script setup lang="ts">
import { onActivated, onDeactivated, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Header, BottomNav, NewsList, SearchBar, CategoryTabs,BackToTop } from '@/components'
import { useAuthStore } from '@/stores/auth'
import { useNewsCategoryStore } from '@/stores/newsCategory'

defineOptions({ name: 'Home' })

const router = useRouter()
const authStore = useAuthStore()
const categoryStore = useNewsCategoryStore()

const handleNewsClick = (id: number) => {
  router.push(`/news/${id}`)
}

const handleSearch = (keyword: string) => {
  // 通过url传递参数给搜索页面
  router.push({ name: 'searchResults', query: { q: keyword } })
}

// 点击用户头像的跳转需要鉴权
const handleUserClick = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    router.push('/profile/info')
  }
}

// 切换到AI页面需要鉴权
const handleTabChange = (tab: string) => {
  if (tab === 'ai' && !authStore.isAuthenticated) {
    router.push('/login')
  } else {
    const routePath = tab === 'home' ? '/' : `/${tab}`
    router.push(routePath)
  }
}

// ---------- 列表区域左右滑动切换分类（移动端手势） ----------
const SWIPE_THRESHOLD = 60    // 最小水平位移（px），低于视为点击/误触
const DIRECTION_RATIO = 1.5   // 方向锁：|Δx| 需超过 |Δy| 的倍数，避免竖向滚动列表时误触发

// 手势区绑在 main 上并用最小高度撑满视口，空分类/短列表时下方空白也可滑；
// tab 条（自身横滚）与搜索栏通过起点检查排除，不参与切分类
const mainRef = ref<HTMLElement | null>(null)
let startX = 0
let startY = 0
let gestureArmed = false

function onTouchStart(e: TouchEvent) {
  if ((e.target as HTMLElement).closest('.nb-tabs, .home__search')) {
    gestureArmed = false
    return
  }
  gestureArmed = true
  startX = e.touches[0]!.clientX
  startY = e.touches[0]!.clientY
}

function onTouchEnd(e: TouchEvent) {
  if (!gestureArmed) return
  const dx = e.changedTouches[0]!.clientX - startX
  const dy = e.changedTouches[0]!.clientY - startY
  if (Math.abs(dx) < SWIPE_THRESHOLD) return
  if (Math.abs(dx) < Math.abs(dy) * DIRECTION_RATIO) return
  // 左滑 → 下一个分类，右滑 → 上一个；到头由 store 钳制
  categoryStore.switchByOffset(dx < 0 ? 1 : -1)
}

// Home 被 keep-alive 缓存，onMounted/onUnmounted 只在应用生命周期内触发一次，
// 进入/离开页面要用 onActivated/onDeactivated 挂载/移除监听
onActivated(() => {
  // 只读坐标不调 preventDefault，passive 保证不阻塞页面自身滚动
  mainRef.value?.addEventListener('touchstart', onTouchStart, { passive: true })
  mainRef.value?.addEventListener('touchend', onTouchEnd, { passive: true })
})

onDeactivated(() => {
  mainRef.value?.removeEventListener('touchstart', onTouchStart)
  mainRef.value?.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <div class="nb-page">
    <Header :avatar="authStore.user?.avatar || null" @user-click="handleUserClick" />

    <main ref="mainRef" class="nb-page-body nb-page-body--with-nav home__main">
      <div class="home__search">
        <SearchBar @search="handleSearch" />
      </div>
      <CategoryTabs />
      <NewsList :category-id="categoryStore.activeCategoryId" @news-click="handleNewsClick" />
    </main>

    <BackToTop />

    <BottomNav active-tab="home" @tab-change="handleTabChange" />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.home {
  &__search {
    padding: $sp-4 $sp-4 $sp-3;
  }

  // 撑满视口，保证空分类/短列表时下方空白区域也在手势监听范围内
  &__main {
    min-height: 100dvh;
  }
}
</style>
