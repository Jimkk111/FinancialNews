<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Radar, Check, Ban, Trash2, Play, Loader2, RefreshCw, X } from 'lucide-vue-next'
import {
  getSourcesService,
  createSourceService,
  probeSourceService,
  approveSourceService,
  disableSourceService,
  deleteSourceService,
  runCrawlService,
} from '@/services/crawlerService'
import type { NewsSource, NewsSourceInput, CrawlResult, CrawlSourceStatus } from '@/types/crawler'
import { formatTime } from '@/utils/format'
import SourceFormModal from './SourceFormModal.vue'

const sources = ref<NewsSource[]>([])
const loading = ref(true)
const error = ref('')
const successMessage = ref('')

const showForm = ref(false)
const formSubmitting = ref(false)

const showProbe = ref(false)
const probeDomain = ref('')
const probing = ref(false)
const probeError = ref('')

const running = ref(false)
const runningSourceId = ref<number | null>(null)
const showRunResult = ref(false)
const runResults = ref<CrawlResult[]>([])

const showDeleteConfirm = ref(false)
const deleteTargetId = ref<number | null>(null)

const statusMeta: Record<CrawlSourceStatus, { label: string; cls: string }> = {
  pending: { label: '待审核', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  approved: { label: '已启用', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  disabled: { label: '已停用', cls: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

const loadSources = async () => {
  loading.value = true
  const response = await getSourcesService()
  if (response.success && response.data) {
    sources.value = response.data
  } else {
    error.value = response.error?.message || '加载失败'
  }
  loading.value = false
}

const flashSuccess = (msg: string) => {
  successMessage.value = msg
  setTimeout(() => {
    successMessage.value = ''
  }, 2000)
}

const openForm = () => {
  error.value = ''
  showForm.value = true
}

const handleCreateSubmit = async (input: NewsSourceInput) => {
  formSubmitting.value = true
  const response = await createSourceService(input)
  formSubmitting.value = false
  if (response.success) {
    showForm.value = false
    flashSuccess('数据源已登记，等待审核')
    loadSources()
  } else {
    error.value = response.error?.message || '登记失败'
  }
}

const openProbe = () => {
  probeError.value = ''
  probeDomain.value = ''
  showProbe.value = true
}

const handleProbe = async () => {
  const domain = probeDomain.value.trim()
  if (!domain) {
    probeError.value = '请输入域名'
    return
  }
  probing.value = true
  probeError.value = ''
  const response = await probeSourceService(domain)
  probing.value = false
  if (response.success) {
    showProbe.value = false
    flashSuccess('探测完成，已生成待审核草案')
    loadSources()
  } else {
    probeError.value = response.error?.message || '探测失败'
  }
}

const handleApprove = async (id: number) => {
  const response = await approveSourceService(id)
  if (response.success) {
    flashSuccess('已通过审核')
    loadSources()
  } else {
    error.value = response.error?.message || '审核失败'
  }
}

const handleDisable = async (id: number) => {
  const response = await disableSourceService(id)
  if (response.success) {
    flashSuccess('已停用')
    loadSources()
  } else {
    error.value = response.error?.message || '停用失败'
  }
}

const askDelete = (id: number) => {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (deleteTargetId.value != null) {
    const response = await deleteSourceService(deleteTargetId.value)
    if (response.success) {
      flashSuccess('已删除')
      loadSources()
    } else {
      error.value = response.error?.message || '删除失败'
    }
  }
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

const handleRun = async (id: number) => {
  running.value = true
  runningSourceId.value = id
  error.value = ''
  const response = await runCrawlService(id)
  running.value = false
  runningSourceId.value = null
  if (response.success && response.data) {
    runResults.value = response.data
    showRunResult.value = true
  } else {
    error.value = response.error?.message || '采集失败'
  }
}

onMounted(() => {
  loadSources()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 space-y-3">
    <!-- 动作栏 -->
    <div class="flex gap-2">
      <button
        @click="openForm"
        class="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-brand text-white hover:bg-brand-hover transition-colors text-sm font-medium"
      >
        <Plus :size="16" />
        <span>登记数据源</span>
      </button>
      <button
        @click="openProbe"
        class="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
      >
        <Radar :size="16" />
        <span>Agent 探测</span>
      </button>
      <button
        @click="loadSources"
        class="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
        title="刷新"
      >
        <RefreshCw :size="16" />
      </button>
    </div>

    <div v-if="successMessage" class="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-sm px-4 py-2 rounded-lg">
      {{ successMessage }}
    </div>
    <div v-if="error" class="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">
      {{ error }}
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="text-center py-12 text-muted-foreground">加载中...</div>

    <div v-else-if="sources.length === 0" class="text-center py-16">
      <div class="text-muted-foreground mb-2">暂无数据源</div>
      <div class="text-sm text-muted-foreground">点击「登记数据源」或「Agent 探测」添加</div>
    </div>

    <div v-else class="space-y-3">
      <div v-for="source in sources" :key="source.id" class="bg-card rounded-xl p-4 border border-border">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-medium text-foreground truncate">{{ source.name }}</h3>
              <span :class="['shrink-0 text-xs px-2 py-0.5 rounded-full', statusMeta[source.status].cls]">
                {{ statusMeta[source.status].label }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1 truncate">{{ source.domain }}</p>
            <p class="text-xs text-muted-foreground mt-0.5 truncate">
              {{ source.rssUrl || source.listUrl || '未配置采集入口' }}
            </p>
            <p class="text-xs text-muted-foreground/70 mt-1">上次采集：{{ formatTime(source.lastCrawlAt) }}</p>
          </div>
        </div>

        <!-- 探测摘要（折叠展示） -->
        <details v-if="source.probeSummary" class="mt-2 text-xs text-muted-foreground">
          <summary class="cursor-pointer hover:text-foreground">探测报告</summary>
          <pre class="whitespace-pre-wrap mt-1 text-xs">{{ source.probeSummary }}</pre>
        </details>

        <div class="flex items-center gap-2 mt-3">
          <template v-if="source.status === 'pending'">
            <button @click="handleApprove(source.id)" class="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors">
              <Check :size="13" /> 通过审核
            </button>
            <button @click="askDelete(source.id)" class="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
              <Trash2 :size="13" /> 删除
            </button>
          </template>

          <template v-else-if="source.status === 'approved'">
            <button @click="handleRun(source.id)" :disabled="running" class="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors disabled:opacity-50">
              <Loader2 v-if="running && runningSourceId === source.id" :size="13" class="animate-spin" />
              <Play v-else :size="13" /> 立即采集
            </button>
            <button @click="handleDisable(source.id)" class="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              <Ban :size="13" /> 停用
            </button>
            <button @click="askDelete(source.id)" class="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
              <Trash2 :size="13" /> 删除
            </button>
          </template>

          <template v-else>
            <button @click="handleApprove(source.id)" class="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors">
              <Check :size="13" /> 重新启用
            </button>
            <button @click="askDelete(source.id)" class="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
              <Trash2 :size="13" /> 删除
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 采集进行中覆盖层 -->
    <div v-if="running" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div class="bg-card rounded-xl px-8 py-6 flex flex-col items-center gap-3">
        <Loader2 :size="32" class="animate-spin text-brand" />
        <p class="text-sm text-foreground">正在采集，可能需要几分钟…</p>
        <p class="text-xs text-muted-foreground">请勿关闭页面</p>
      </div>
    </div>

    <!-- 采集结果弹窗 -->
    <div v-if="showRunResult" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div class="bg-card rounded-xl p-5 w-full max-w-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-foreground">采集结果</h3>
          <button @click="showRunResult = false" class="p-1 -mr-1 hover:bg-muted rounded-full transition-colors">
            <X :size="16" />
          </button>
        </div>
        <div class="space-y-2">
          <div v-for="r in runResults" :key="r.sourceId" class="border border-border rounded-lg p-3">
            <p class="text-sm font-medium text-foreground mb-2">{{ r.sourceName }}</p>
            <div class="grid grid-cols-2 gap-y-1 text-sm text-muted-foreground">
              <span>发现 {{ r.discovered }} 条</span>
              <span class="text-green-600">成功 {{ r.success }}</span>
              <span class="text-red-500">失败 {{ r.failed }}</span>
              <span>重复 {{ r.duplicate }}</span>
              <span>跳过 {{ r.intervalSkipped }}</span>
            </div>
            <p v-if="r.error" class="text-xs text-red-500 mt-1">{{ r.error }}</p>
          </div>
        </div>
        <button @click="showRunResult = false" class="w-full h-10 mt-4 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-medium">
          知道了
        </button>
      </div>
    </div>

    <!-- Agent 探测弹窗 -->
    <div v-if="showProbe" class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div class="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-foreground">Agent 探测</h3>
          <button @click="showProbe = false" class="p-1 -mr-1 hover:bg-muted rounded-full transition-colors">
            <X :size="18" />
          </button>
        </div>
        <p class="text-sm text-muted-foreground mb-4">输入目标站点域名，Agent 将自动分析页面结构并生成待审核的数据源草案。</p>
        <input v-model="probeDomain" type="text" placeholder="如：finance.eastmoney.com" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" @keyup.enter="handleProbe" />
        <p v-if="probeError" class="text-sm text-red-500 mt-2">{{ probeError }}</p>
        <div class="flex gap-3 mt-4">
          <button @click="showProbe = false" class="flex-1 h-11 rounded-xl border border-border text-foreground hover:bg-muted transition-colors">取消</button>
          <button @click="handleProbe" :disabled="probing" class="flex-1 h-11 rounded-xl bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50">
            {{ probing ? '探测中...' : '开始探测' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div class="bg-card rounded-xl p-6 max-w-sm mx-4">
        <h3 class="text-lg font-semibold text-foreground mb-2">确认删除</h3>
        <p class="text-muted-foreground mb-4">确定要删除这个数据源吗？此操作不可撤销。</p>
        <div class="flex gap-3 justify-end">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">取消</button>
          <button @click="confirmDelete" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">删除</button>
        </div>
      </div>
    </div>

    <!-- 登记表单 -->
    <SourceFormModal v-if="showForm" :submitting="formSubmitting" @close="showForm = false" @submit="handleCreateSubmit" />
  </div>
</template>
