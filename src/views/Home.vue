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
  router.push({ name: 'searchResults', query: { q: keyword } })
}

const handleUserClick = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    router.push('/profile/info')
  }
}

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
  <div class="min-h-screen bg-background">
    <Header :avatar="authStore.user?.avatar || null" @user-click="handleUserClick" />

    <main class="pt-14 pb-16">
      <div class="pt-4"></div>
      <SearchBar @search="handleSearch" />
      <CategoryTabs @category-change="selectedCategoryId = $event" />
      <NewsList :category-id="selectedCategoryId" @news-click="handleNewsClick" />
    </main>

    <BottomNav active-tab="home" @tab-change="handleTabChange" />
  </div>
</template>
