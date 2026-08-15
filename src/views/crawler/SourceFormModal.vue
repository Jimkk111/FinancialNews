<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { X, ChevronDown } from 'lucide-vue-next'
import { getNewsCategories } from '@/services/newsService'
import type { Category } from '@/types'
import type { NewsSourceInput } from '@/types/crawler'

const props = defineProps<{ submitting: boolean }>()

const emit = defineEmits<{
  close: []
  submit: [input: NewsSourceInput]
}>()

const categories = ref<Category[]>([])
const showAdvanced = ref(false)
const error = ref('')

const form = reactive<NewsSourceInput>({
  name: '',
  domain: '',
  rssUrl: '',
  listUrl: '',
  listItemSelector: '',
  titleSelector: '',
  contentSelector: '',
  publishTimeSelector: '',
  defaultCategoryId: null,
  crawlIntervalSeconds: 1800,
  rateLimitMs: 3000,
})

onMounted(async () => {
  try {
    categories.value = await getNewsCategories()
  } catch {
    // 分类加载失败不阻塞表单
  }
})

const toNullable = (v: string | null | undefined) => {
  const t = (v ?? '').trim()
  return t ? t : null
}

const handleSubmit = () => {
  error.value = ''
  const name = form.name.trim()
  const domain = form.domain.trim()

  if (!name) {
    error.value = '请输入数据源名称'
    return
  }
  if (!domain) {
    error.value = '请输入域名'
    return
  }
  if (!form.rssUrl?.trim() && !form.listUrl?.trim()) {
    error.value = 'RSS 地址与列表页 URL 至少填写一项'
    return
  }

  emit('submit', {
    name,
    domain,
    rssUrl: toNullable(form.rssUrl),
    listUrl: toNullable(form.listUrl),
    listItemSelector: toNullable(form.listItemSelector),
    titleSelector: toNullable(form.titleSelector),
    contentSelector: toNullable(form.contentSelector),
    publishTimeSelector: toNullable(form.publishTimeSelector),
    defaultCategoryId: form.defaultCategoryId,
    crawlIntervalSeconds: form.crawlIntervalSeconds,
    rateLimitMs: form.rateLimitMs,
  })
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
    <div class="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
        <h2 class="text-base font-semibold text-foreground">登记数据源</h2>
        <button @click="emit('close')" class="p-1.5 -mr-1.5 hover:bg-muted rounded-full transition-colors">
          <X :size="18" />
        </button>
      </div>

      <div class="px-5 py-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">名称 <span class="text-brand">*</span></label>
          <input v-model="form.name" type="text" placeholder="如：人民网财经" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">域名 <span class="text-brand">*</span></label>
          <input v-model="form.domain" type="text" placeholder="如：people.com.cn" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
          <p class="text-xs text-muted-foreground mt-1">后端会自动归一化为域名</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">RSS 地址</label>
          <input v-model="form.rssUrl" type="text" placeholder="有 RSS 优先填此项" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">列表页 URL</label>
          <input v-model="form.listUrl" type="text" placeholder="无 RSS 时填列表页地址" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
        </div>

        <button
          @click="showAdvanced = !showAdvanced"
          class="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>高级设置（CSS 选择器、抓取策略）</span>
          <ChevronDown :size="16" :class="showAdvanced ? 'rotate-180 transition-transform' : 'transition-transform'" />
        </button>

        <div v-if="showAdvanced" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">列表项选择器</label>
            <input v-model="form.listItemSelector" type="text" placeholder="如 .list li a" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">标题选择器</label>
            <input v-model="form.titleSelector" type="text" placeholder="如 h1.title" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">正文选择器</label>
            <input v-model="form.contentSelector" type="text" placeholder="如 .article-body" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">发布时间选择器</label>
            <input v-model="form.publishTimeSelector" type="text" placeholder="如 .time" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">默认分类</label>
            <select v-model="form.defaultCategoryId" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base appearance-none">
              <option :value="null">不指定</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">抓取间隔（秒）</label>
              <input v-model.number="form.crawlIntervalSeconds" type="number" min="60" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">请求间隔（毫秒）</label>
              <input v-model.number="form.rateLimitMs" type="number" min="500" class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base" />
            </div>
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </div>

      <div class="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
        <button @click="emit('close')" class="flex-1 h-11 rounded-xl border border-border text-foreground hover:bg-muted transition-colors">取消</button>
        <button @click="handleSubmit" :disabled="submitting" class="flex-1 h-11 rounded-xl bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50">
          {{ submitting ? '提交中...' : '提交登记' }}
        </button>
      </div>
    </div>
  </div>
</template>
