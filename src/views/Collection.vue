<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Clock, Eye, Heart, Trash2 } from 'lucide-vue-next'
import { getFavorites, removeFavorite } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'
import { formatTime } from '@/utils/format'
import type { NewsItem, PaginationInfo } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const displayId = authStore.user?.displayId || ''

const handleBack = () => {
  router.push('/profile')
}

const handleNewsClick = (id: number) => {
  router.push(`/news/${id}`)
}

const state = reactive<{
  items: NewsItem[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo
}>({
  items: [],
  loading: true,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  },
})

const fetchFavorites = async () => {
  if (!displayId) {
    state.loading = false
    state.error = '用户未登录'
    return
  }

  state.loading = true
  state.error = null

  try {
    const response = await getFavorites(
      state.pagination.page,
      state.pagination.pageSize,
    )

    if (response.success && response.data) {
      state.items = response.data.data
      state.loading = false
      state.error = null
      state.pagination = response.data.pagination
    } else {
      state.loading = false
      state.error = response.error?.message || '获取收藏列表失败'
    }
  } catch (error) {
    state.loading = false
    state.error = '网络错误，请稍后重试'
    console.error('获取收藏列表失败:', error)
  }
}

const handleRemoveFavorite = async (newsId: number, e: Event) => {
  e.stopPropagation()

  if (!displayId) return

  try {
    const response = await removeFavorite(newsId)

    if (response.success) {
      state.items = state.items.filter((item) => item.id !== newsId)
      state.pagination.total = Math.max(0, state.pagination.total - 1)
    } else {
      console.error('取消收藏失败:', response.error?.message)
    }
  } catch (error) {
    console.error('取消收藏失败:', error)
  }
}

watch(() => displayId, fetchFavorites)
watch(() => state.pagination.page, fetchFavorites)

onMounted(fetchFavorites)
</script>

<template>
  <div class="min-h-screen bg-muted">
    <header class="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div class="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
        <button
          @click="handleBack"
          class="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft :size="20" />
        </button>
        <span class="font-medium">我的收藏</span>
        <div class="w-8"></div>
      </div>
    </header>

    <main class="pt-14 pb-16">
      <div v-if="state.loading" class="flex items-center justify-center h-64">
        <div class="text-muted-foreground">加载中...</div>
      </div>

      <div v-else-if="state.error" class="flex items-center justify-center h-64">
        <div class="text-red-500">{{ state.error }}</div>
      </div>

      <div v-else-if="state.items.length > 0" class="divide-y divide-border">
        <div
          v-for="item in state.items"
          :key="item.id"
          class="bg-card p-4 hover:bg-muted transition-colors"
          @click="handleNewsClick(item.id)"
        >
          <div class="flex flex-col gap-3">
            <h3 class="text-base font-medium text-foreground leading-relaxed">
              {{ item.title }}
            </h3>

            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <div class="flex items-center gap-3">
                <span class="text-blue-600">{{ item.source }}</span>
                <div class="flex items-center gap-1">
                  <Clock :size="12" />
                  <span>{{ formatTime(item.publishTime) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Eye :size="12" />
                  <span>{{ item.views }} 阅读</span>
                </div>
              </div>
              <button
                @click="handleRemoveFavorite(item.id, $event)"
                class="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                title="取消收藏"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-64">
        <Heart class="text-muted-foreground/50" :size="48" />
        <p class="text-muted-foreground mt-3">暂无收藏内容</p>
        <p class="text-muted-foreground/70 text-sm mt-1">收藏的新闻会显示在这里</p>
      </div>
    </main>
  </div>
</template>
