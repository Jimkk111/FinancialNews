<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { getNewsList } from '@/services/newsService'
import { formatTime } from '@/utils/format'
import NewsItem from './NewsItem.vue'
import type { NewsItem as NewsItemType } from '@/types'

interface Props {
  categoryId?: number | null
}

interface LocalNewsItem {
  id: number
  title: string
  source: string | null
  time: string
  views: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  newsClick: [id: number]
}>()

const newsData = ref<LocalNewsItem[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const hasMore = ref(true)
const isLoadingLocked = ref(false)
const observerRef = ref<HTMLDivElement | null>(null)
let observer: IntersectionObserver | null = null

const fetchNews = async () => {
  if (isLoadingLocked.value) return
  isLoadingLocked.value = true
  try {
    if (page.value === 1) {
      loading.value = true
    } else {
      loadingMore.value = true
    }
    error.value = null

    const response = await getNewsList(
      page.value,
      20,
      props.categoryId || undefined,
      'newest'
    )

    const formattedNews: LocalNewsItem[] = response.data.map((news: NewsItemType) => ({
      id: news.id,
      title: news.title,
      source: news.source,
      time: formatTime(news.publishTime),
      views: news.views,
    }))

    if (page.value === 1) {
      newsData.value = formattedNews
    } else {
      newsData.value = [...newsData.value, ...formattedNews]
    }

    hasMore.value = page.value < response.pagination.totalPages
  } catch (err) {
    error.value = '获取新闻列表失败，请稍后重试'
  } finally {
    loading.value = false
    loadingMore.value = false
    isLoadingLocked.value = false
  }
}

watch(() => props.categoryId, () => {
  page.value = 1
  newsData.value = []
  hasMore.value = true
  fetchNews()
  nextTick(() => setupObserver())
})

watch(page, (newPage) => {
  if (newPage > 1) {
    fetchNews()
  }
})

const setupObserver = () => {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0] && entries[0].isIntersecting && hasMore.value && !isLoadingLocked.value) {
        page.value++
      }
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px 200px 0px'
    }
  )

  if (observerRef.value) {
    observer.observe(observerRef.value)
  }
}

onMounted(async () => {
  await fetchNews()
  await nextTick()
  setupObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="pb-20">
    <div v-if="loading && newsData.length === 0" class="py-8 text-center text-muted-foreground">
      加载中...
    </div>

    <div v-else-if="error && newsData.length === 0" class="py-8 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="newsData.length === 0" class="text-center py-10">
      <p class="text-muted-foreground">该分类暂无新闻</p>
      <p class="text-muted-foreground/70 text-sm mt-2">请尝试选择其他分类</p>
    </div>

    <DynamicScroller
      v-else
      :items="newsData"
      :min-item-size="80"
      key-field="id"
      page-mode
    >
      <template #default="{ item, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.title]"
        >
          <NewsItem
            :id="item.id"
            :title="item.title"
            :source="item.source"
            :time="item.time"
            :views="item.views"
            @click="emit('newsClick', $event)"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <div v-if="loadingMore" class="text-center py-4 text-muted-foreground text-sm">
      加载更多新闻...
    </div>

    <div v-if="hasMore" ref="observerRef" class="h-1"></div>

    <div v-if="!hasMore && newsData.length > 0" class="text-center py-4 text-muted-foreground/70 text-sm">
      已加载全部新闻
    </div>
  </div>
</template>
