<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getPublishedList } from '@/services/newsEditorService'
import { deletePublishedNews } from '@/api/draft'
import { formatTime } from '@/utils/format'
import type { PublishedNews, PaginationInfo } from '@/types'

const router = useRouter()

const handleBack = () => {
  router.push('/profile')
}

const handleNewsClick = (id: number) => {
  router.push(`/news/${id}`)
}

const publishedList = ref<PublishedNews[]>([])
const loading = ref(true)
const showDeleteConfirm = ref(false)
const deleteTargetId = ref<number | null>(null)
const pagination = ref<PaginationInfo>({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

const loadPublished = async (page: number = 1) => {
  loading.value = true
  const response = await getPublishedList(page, pagination.value.pageSize)
  if (response.success && response.data) {
    publishedList.value = response.data
    if (response.pagination) {
      pagination.value = response.pagination
    }
  }
  loading.value = false
}

const handleDelete = (id: number) => {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (deleteTargetId.value !== null) {
    try {
      await deletePublishedNews(deleteTargetId.value)
      loadPublished(pagination.value.page)
    } catch {
      // 删除失败
    }
  }
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadPublished(page)
  }
}

const visiblePages = () => {
  const current = pagination.value.page
  const total = pagination.value.totalPages
  const pages: (number | string)[] = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 3) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 2) {
      pages.push('...')
    }
    
    pages.push(total)
  }
  
  return pages
}

onMounted(() => {
  loadPublished()
})
</script>

<template>
  <div class="min-h-screen bg-muted">
    <header class="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div class="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        <button
          @click="handleBack"
          class="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-lg font-semibold text-foreground">我的发布</h1>
        <div class="w-10"></div>
      </div>
    </header>

    <main class="pt-14 pb-8">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div v-if="loading" class="text-center py-8 text-muted-foreground">
          加载中...
        </div>

        <div v-else-if="publishedList.length === 0" class="text-center py-16">
          <div class="text-muted-foreground mb-2">暂无发布的新闻</div>
          <div class="text-sm text-muted-foreground">发布后可以在这里查看</div>
        </div>

        <template v-else>
          <div class="space-y-3">
            <div
              v-for="news in publishedList"
              :key="news.id"
              class="bg-card rounded-xl overflow-hidden shadow-sm"
            >
              <div class="flex gap-3 p-4">
                <div class="flex-1 min-w-0">
                  <h3
                    class="text-base font-semibold text-foreground line-clamp-2 mb-2 cursor-pointer hover:text-brand"
                    @click="handleNewsClick(news.id)"
                  >
                    {{ news.title }}
                  </h3>
                  <p class="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {{ news.summary }}
                  </p>
                  <div class="flex items-center justify-between text-xs text-muted-foreground/70">
                    <div class="flex items-center gap-3">
                      <span class="flex items-center gap-1">
                        <Clock :size="14" />
                        {{ formatTime(news.publishTime) }}
                      </span>
                      <span class="flex items-center gap-1">
                        <Eye :size="14" />
                        {{ news.views }}
                      </span>
                    </div>
                    <button
                      @click.stop="handleDelete(news.id)"
                      class="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 :size="14" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft :size="18" />
            </button>
            
            <template v-for="(page, index) in visiblePages()" :key="index">
              <span v-if="page === '...'" class="px-2 text-muted-foreground">...</span>
              <button
                v-else
                @click="goToPage(page as number)"
                :class="[
                  'min-w-[36px] h-9 px-3 rounded-lg transition-colors',
                  page === pagination.page
                    ? 'bg-brand text-white'
                    : 'hover:bg-muted text-foreground'
                ]"
              >
                {{ page }}
              </button>
            </template>
            
            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight :size="18" />
            </button>
          </div>

          <div class="text-center text-sm text-muted-foreground mt-4">
            共 {{ pagination.total }} 条记录
          </div>
        </template>
      </div>
    </main>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-card rounded-xl p-6 max-w-sm mx-4">
        <h3 class="text-lg font-semibold text-foreground mb-2">确认删除</h3>
        <p class="text-muted-foreground mb-4">确定要删除这篇新闻吗？此操作不可撤销。</p>
        <div class="flex gap-3 justify-end">
          <button
            @click="cancelDelete"
            class="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
