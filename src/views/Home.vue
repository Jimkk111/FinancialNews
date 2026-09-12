<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Header, BottomNav, NewsList, SearchBar, CategoryTabs } from '@/components'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'Home' })

const router = useRouter()
const authStore = useAuthStore()
const selectedCategoryId = ref<number | null>(null)

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
</script>

<template>
  <div class="nb-page">
    <Header :avatar="authStore.user?.avatar || null" @user-click="handleUserClick" />

    <main class="nb-page-body nb-page-body--with-nav">
      <div class="home__search">
        <SearchBar @search="handleSearch" />
      </div>
      <CategoryTabs @category-change="selectedCategoryId = $event" />
      <NewsList :category-id="selectedCategoryId" @news-click="handleNewsClick" />
    </main>

    <BottomNav active-tab="home" @tab-change="handleTabChange" />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.home {
  &__search {
    padding: $sp-4 $sp-4 $sp-3;
  }
}
</style>
