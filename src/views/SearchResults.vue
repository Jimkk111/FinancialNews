<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { searchNews } from '@/services/newsService'
import { formatTime } from '@/utils/format'
import BottomNav from '@/components/BottomNav.vue'
import NewsItem from '@/components/NewsItem.vue'
import type { NewsItem as NewsItemType } from '@/types'

const router = useRouter()
const route = useRoute()

const keyword = computed(() => (route.query.q as string) || '')

const results = ref<NewsItemType[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const performSearch = async () => {
  if (!keyword.value.trim()) {
    results.value = []
    loading.value = false
    error.value = null
    return
  }

  try {
    loading.value = true
    error.value = null
    const response = await searchNews(keyword.value.trim())
    results.value = response.data || []
  } catch (err) {
    error.value = '搜索失败，请稍后重试'
    results.value = []
  } finally {
    loading.value = false
  }
}

watch(() => keyword.value, performSearch)

const handleBack = () => {
  router.push('/')
}

const handleNewsClick = (id: number) => {
  router.push(`/news/${id}`)
}

const handleTabChange = (tab: string) => {
  const routePath = tab === 'home' ? '/' : `/${tab}`
  router.push(routePath)
}

onMounted(performSearch)
</script>

<template>
  <div class="min-h-screen bg-muted">
    <div class="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
      <button
        @click="handleBack"
        class="p-2 rounded-full hover:bg-muted"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="m12 19-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="text-lg font-semibold">搜索结果</h1>
    </div>

    <div class="p-4 pb-20">
      <div class="mb-4">
        <p class="text-sm text-muted-foreground">
          搜索关键词: <span class="text-foreground font-medium">{{ keyword }}</span>
        </p>
        <p class="text-sm text-muted-foreground mt-1">
          找到 {{ results.length }} 条相关新闻
        </p>
      </div>

      <div v-if="loading" class="text-center py-10">
        <p class="text-muted-foreground">搜索中...</p>
      </div>

      <div v-else-if="error" class="text-center py-10">
        <p class="text-red-500">{{ error }}</p>
      </div>

      <div v-else-if="results.length === 0" class="text-center py-10">
        <p class="text-muted-foreground">未找到相关新闻</p>
        <p class="text-muted-foreground/70 text-sm mt-2">请尝试使用其他关键词</p>
      </div>

      <div v-else>
        <NewsItem
          v-for="item in results"
          :key="item.id"
          :id="item.id"
          :title="item.title"
          :source="item.source"
          :time="formatTime(item.publishTime)"
          :views="item.views"
          @click="handleNewsClick"
        />
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-10">
      <BottomNav active-tab="home" @tab-change="handleTabChange" />
    </div>
  </div>
</template>
