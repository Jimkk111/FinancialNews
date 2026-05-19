<!-- 
  问题1：类型管理混乱，接口定义分布于不同的文件
  问题2：没有统一管理Axios实例和拦截器
  问题3：样式平庸
  问题4：只有一级路由，并且一级路由管理过多路由实例
-->

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  MoreVertical,
  Share2,
} from 'lucide-vue-next'
import {
  getNewsDetail,
  incrementNewsViews,
  getNewsList,
} from '@/services/newsService'
import {
  addHistory,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '@/services/userService'
import { formatTime } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'
import type { NewsDetail as NewsType, NewsItem ,IResponseNewsDetail} from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const newsId = ref(Number(route.params.id))
const displayId = authStore.user?.displayId || ''

const news = ref<IResponseNewsDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isFavorited = ref(false)
const favoriting = ref(false)
const menuOpen = ref(false)
const relatedNews = ref<NewsItem[]>([])

const addNewsHistory = async () => {
  if (!displayId || !news.value) return

  try {
    await addHistory(newsId.value, {
      title: news.value.data.title,
      source: news.value.data.source,
      publish_time: news.value.data.publishTime,
      views: news.value.data.views,
    })
  } catch (err) {
    console.error('添加历史记录失败:', err)
  }
}

const checkFavoritedStatus = async () => {
  if (!displayId) return

  try {
    const response = await checkFavorite(newsId.value)
    if (response.success && response.data) {
      isFavorited.value = response.data.is_favorite
    }
  } catch (err) {
    console.error('检查收藏状态失败:', err)
  }
}

const toggleFavorite = async () => {
  if (!displayId || favoriting.value || !news.value) return

  favoriting.value = true

  try {
    if (isFavorited.value) {
      const response = await removeFavorite(newsId.value)
      if (response.success) {
        isFavorited.value = false
      } else {
        console.error('取消收藏失败:', response.error?.message)
      }
    } else {
      const response = await addFavorite(newsId.value, {
        title: news.value.data.title,
        source: news.value.data.source,
        publish_time: news.value.data.publishTime,
        views: news.value.data.views,
      })
      if (response.success) {
        isFavorited.value = true
      } else {
        console.error('添加收藏失败:', response.error?.message)
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  } finally {
    favoriting.value = false
  }
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const handleShare = async () => {
  if (!news.value) return

  const shareData = {
    title: news.value.data.title,
    text: news.value.data.summary,
    url: window.location.href,
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.error('分享失败:', err)
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('链接已复制')
    } catch (err) {
      console.error('复制链接失败:', err)
    }
  }
}

const getRelatedNews = (currentNews: NewsType, allNews: NewsItem[]): NewsItem[] => {
  const sameTags = allNews.filter((n) =>
    n.id !== currentNews.id &&
    n.tags?.some((t) => currentNews.tags?.some((ct) => ct.id === t.id))
  )

  const sameCategory = allNews.filter(
    (n) =>
      n.id !== currentNews.id && n.category?.id === currentNews.category?.id
  )

  const related = [...new Set([...sameTags, ...sameCategory])]
  return related.slice(0, 5)
}

const loadRelatedNews = async (currentNews: NewsType) => {
  try {
    const response = await getNewsList(1, 50, currentNews.categoryId || undefined)
    const related = getRelatedNews(currentNews, response.data)
    relatedNews.value = related
  } catch (error) {
    console.error('加载相关阅读失败:', error)
  }
}

const formatContent = (content: string): string => {
  if (!content) return ''
  
  if (/<p[\s>]/i.test(content) || /<br[\s\/]*>/i.test(content)) {
    return content
  }
  
  return content
    .split(/\n\s*\n/)
    .filter(para => para.trim())
    .map(para => {
      const cleanedPara = para
        .replace(/[ \t]+/g, ' ')
        .replace(/^[ \t]+/gm, '')
        .replace(/\n/g, '<br>')
      return `<p>${cleanedPara}</p>`
    })
    .join('')
}

const fetchNewsDetail = async () => {
  try {
    loading.value = true
    error.value = null
    const res = await getNewsDetail(newsId.value)
    news.value = res 
    console.log(res)

    try {
      await incrementNewsViews(newsId.value)
    } catch (viewError) {
      console.error('增加阅读量失败:', viewError)
    }

    await addNewsHistory()
    await checkFavoritedStatus()
    
    await loadRelatedNews(news.value.data)  
  } catch (err) {
    error.value = '获取新闻详情失败，请稍后重试'
    console.error('获取新闻详情失败:', err)
  } finally {
    loading.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.menu-container')) {
    closeMenu()
  }
}

watch(() => newsId.value, fetchNewsDetail)

onMounted(() => {
  fetchNewsDetail()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div v-if="loading" class="min-h-screen bg-muted flex items-center justify-center">
    <div class="text-muted-foreground">加载中...</div>
  </div>

  <div v-else-if="error || !news" class="min-h-screen bg-muted flex items-center justify-center">
    <div class="text-red-500">{{ error || '新闻不存在' }}</div>
  </div>

  <div v-else class="min-h-screen bg-muted">
    <header class="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div class="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
        <button
          @click="router.push('/')"
          class="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft :size="20" />
        </button>
        <span class="font-medium text-base">新闻详情</span>
        <div class="relative menu-container">
          <button
            @click="toggleMenu"
            class="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <MoreVertical :size="20" />
          </button>

          <div
            v-if="menuOpen"
            class="absolute right-0 top-full mt-2 w-40 bg-card rounded-lg shadow-lg border border-border py-2 z-50"
          >
            <button
              @click="toggleFavorite(); closeMenu()"
              class="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
              :disabled="!displayId || favoriting"
            >
              <Heart
                :size="20"
                :fill="isFavorited ? 'var(--brand)' : 'none'"
                :class="isFavorited ? 'text-brand' : 'text-muted-foreground'"
              />
              <span :class="isFavorited ? 'text-brand' : 'text-foreground'" class="text-sm">
                {{ isFavorited ? '已收藏' : '收藏' }}
              </span>
            </button>

            <button
              @click="handleShare; closeMenu()"
              class="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
            >
              <Share2 :size="20" class="text-muted-foreground" />
              <span class="text-sm text-foreground">分享</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="pt-14 max-w-3xl mx-auto">
      <div class="bg-card px-4 py-5">
        <h1 class="text-[20px] font-bold text-foreground mb-4 leading-tight">
          {{ news.data.title }}
        </h1>

        <div class="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span class="text-brand font-medium">{{ news.data.source }}</span>
          <div class="flex items-center gap-1">
            <Clock :size="12" />
            <span>{{ formatTime(news.data.publishTime) }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Eye :size="12" />
            <span>{{ news.data.views }} 阅读</span>
          </div>
        </div>
      </div>

      <article class="bg-card px-4 py-5 mt-2">
        <div
          class="tiptap text-foreground"
          v-html="formatContent(news.data.content)"
        />
      </article>

      <div v-if="news.data.tags && news.data.tags.length > 0" class="bg-card px-4 py-4 mt-2">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in news.data.tags" 
            :key="tag.id"
            class="px-3 py-1 bg-muted text-foreground text-sm rounded-full"
          >
            #{{ tag.name }}
          </span>
        </div>
      </div>

      <div v-if="relatedNews.length > 0" class="bg-card px-4 py-4 mt-2">
        <h3 class="text-base font-semibold text-foreground mb-3">相关阅读</h3>
        <div class="space-y-3">
          <div
            v-for="item in relatedNews"
            :key="item.id"
            class="flex items-start gap-3 py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted -mx-2 px-2 rounded transition-colors"
          >
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-foreground line-clamp-2 mb-1">
                {{ item.title }}
              </h4>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span class="text-brand">{{ item.source }}</span>
                <span>{{ formatTime(item.publishTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
