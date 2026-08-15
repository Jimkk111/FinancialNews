<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getCrawlLogsService, getSourcesService } from '@/services/crawlerService'
import type { CrawlLog, CrawlLogStatus, NewsSource } from '@/types/crawler'
import type { PaginationInfo } from '@/types'
import { formatTime } from '@/utils/format'

const logs = ref<CrawlLog[]>([])
const sources = ref<NewsSource[]>([])
const loading = ref(true)
const error = ref('')
const sourceFilter = ref<number | null>(null)

const pagination = ref<PaginationInfo>({ page: 1, pageSize: 20, total: 0, totalPages: 0 })

const logStatusMeta: Record<CrawlLogStatus, { label: string; cls: string }> = {
  success: { label: '成功', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  failed: { label: '失败', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  duplicate: { label: '重复', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  skipped: { label: '跳过', cls: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

const loadSources = async () => {
  const response = await getSourcesService()
  if (response.success && response.data) {
    sources.value = response.data
  }
}

const loadLogs = async (page: number = 1) => {
  loading.value = true
  error.value = ''
  const response = await getCrawlLogsService(page, pagination.value.pageSize, sourceFilter.value ?? undefined)
  if (response.success && response.data) {
    logs.value = response.data
    if (response.pagination) {
      pagination.value = response.pagination
    }
  } else {
    error.value = response.error?.message || '加载日志失败'
  }
  loading.value = false
}

const handleSourceChange = () => {
  loadLogs(1)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadLogs(page)
  }
}

const visiblePages = () => {
  const current = pagination.value.page
  const total = pagination.value.totalPages
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
}

onMounted(() => {
  loadSources()
  loadLogs()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 space-y-3">
    <!-- 筛选栏 -->
    <div class="flex gap-2">
      <select
        v-model="sourceFilter"
        @change="handleSourceChange"
        class="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm appearance-none"
      >
        <option :value="null">全部数据源</option>
        <option v-for="s in sources" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <button
        @click="loadLogs(pagination.page)"
        class="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
        title="刷新"
      >
        <RefreshCw :size="16" />
      </button>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center py-12 text-muted-foreground">加载中...</div>

    <div v-else-if="logs.length === 0" class="text-center py-16 text-muted-foreground">暂无抓取日志</div>

    <template v-else>
      <div class="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
        <div v-for="log in logs" :key="log.id" class="px-4 py-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="text-sm text-foreground line-clamp-2">{{ log.title || log.url }}</p>
              <p class="text-xs text-muted-foreground mt-1 truncate">{{ log.url }}</p>
            </div>
            <div class="shrink-0 text-right">
              <span :class="['inline-block text-xs px-2 py-0.5 rounded-full', logStatusMeta[log.status].cls]">
                {{ logStatusMeta[log.status].label }}
              </span>
              <p class="text-xs text-muted-foreground mt-1">{{ log.costMs }}ms</p>
              <p class="text-xs text-muted-foreground/70 mt-0.5">{{ formatTime(log.createdAt) }}</p>
            </div>
          </div>
          <p v-if="log.errorMsg" class="text-xs text-red-500 mt-1 line-clamp-2">{{ log.errorMsg }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
        <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page === 1" class="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft :size="18" />
        </button>
        <template v-for="(page, index) in visiblePages()" :key="index">
          <span v-if="page === '...'" class="px-2 text-muted-foreground">...</span>
          <button
            v-else
            @click="goToPage(page as number)"
            :class="[
              'min-w-[36px] h-9 px-3 rounded-lg transition-colors',
              page === pagination.page ? 'bg-brand text-white' : 'hover:bg-muted text-foreground'
            ]"
          >
            {{ page }}
          </button>
        </template>
        <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages" class="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <ChevronRight :size="18" />
        </button>
      </div>

      <div class="text-center text-sm text-muted-foreground mt-2">共 {{ pagination.total }} 条记录</div>
    </template>
  </div>
</template>
