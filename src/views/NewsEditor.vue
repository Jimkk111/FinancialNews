<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Save, Send } from 'lucide-vue-next'
import ImageUploader from '@/components/editor/ImageUploader.vue'
import TagSelector from '@/components/editor/TagSelector.vue'
import TiptapEditor from '@/components/editor/TiptapEditor.vue'
import {
  getDraft,
  createDraftService,
  updateDraftService,
  publishNewsService,
} from '@/services/newsEditorService'
import { getNewsCategories } from '@/services/newsService'
import type { Category } from '@/types'
import type { ArticleContent } from '@/types/content'
import { htmlToBlocks } from '@/utils/content/htmlToBlocks'
import { blocksToHtml } from '@/utils/content/blocksToHtml'

const router = useRouter()
const route = useRoute()

const draftId = computed(() => route.query.draftId as string | undefined)

const title = ref('')
const coverImage = ref<string | null>(null)
const selectedTags = ref<number[]>([])
const selectedCategory = ref<number | null>(null)
const content = ref<ArticleContent>([])
const currentDraftId = ref<string | null>(null)
const saving = ref(false)
const publishing = ref(false)
const error = ref('')
const successMessage = ref('')
const categories = ref<Category[]>([])

let autoSaveTimer: ReturnType<typeof setInterval> | null = null

// 自动保存脏检查：记录上次保存成功时的快照，仅当有改动时才保存
let lastSavedSnapshot = ''

const buildSnapshot = () =>
  JSON.stringify({
    title: title.value,
    coverImage: coverImage.value,
    categoryId: selectedCategory.value,
    tags: selectedTags.value,
    content: content.value,
  })

const loadCategories = async () => {
  try {
    categories.value = await getNewsCategories()
  } catch {
    error.value = '加载分类失败'
  }
}

const handleBack = () => {
  router.push('/profile')
}

const loadDraft = async () => {
  const id = draftId.value
  if (!id) return

  const response = await getDraft(id)
  if (response.success && response.data) {
    const draft = response.data
    currentDraftId.value = draft.id
    title.value = draft.title
    coverImage.value = draft.coverImage
    selectedCategory.value = draft.categoryId
    selectedTags.value = draft.tags ?? []
    content.value = htmlToBlocks(draft.content || '')
    lastSavedSnapshot = buildSnapshot()
  }
}

watch(() => draftId, () => {
  loadDraft()
}, { immediate: true })

const saveDraft = async (showSuccess = true) => {
  if (saving.value) return
  saving.value = true
  error.value = ''

  const payload = {
    title: title.value || '未命名草稿',
    content: blocksToHtml(content.value),
    coverImage: coverImage.value,
    categoryId: selectedCategory.value,
    tags: selectedTags.value,
  }

  try {
    if (currentDraftId.value) {
      const response = await updateDraftService(currentDraftId.value, payload)
      if (response.success && response.data) {
        if (showSuccess) {
          successMessage.value = '草稿已保存'
          setTimeout(() => {
            successMessage.value = ''
          }, 2000)
        }
      } else {
        error.value = response.error?.message || '保存失败'
        return
      }
    } else {
      const response = await createDraftService(payload)
      if (response.success && response.data) {
        currentDraftId.value = response.data.id
        if (showSuccess) {
          successMessage.value = '草稿已保存'
          setTimeout(() => {
            successMessage.value = ''
          }, 2000)
        }
      } else {
        error.value = response.error?.message || '保存失败'
        return
      }
    }

    lastSavedSnapshot = buildSnapshot()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    saving.value = false
  }
}

const publish = async () => {
  if (!title.value.trim()) {
    error.value = '请输入新闻标题'
    return
  }
  if (content.value.length === 0) {
    error.value = '请输入新闻内容'
    return
  }

  publishing.value = true
  error.value = ''

  // 先保存，确保发布的是最新内容，并保证 currentDraftId 存在
  await saveDraft(false)

  if (!currentDraftId.value) {
    error.value = '草稿保存失败，无法发布'
    publishing.value = false
    return
  }

  const response = await publishNewsService(currentDraftId.value)

  if (response.success && response.data) {
    router.push(`/news/${response.data.id}`)
  } else {
    error.value = response.error?.message || '发布失败'
  }

  publishing.value = false
}

onMounted(() => {
  loadCategories()
  autoSaveTimer = setInterval(() => {
    if ((title.value || content.value.length) && buildSnapshot() !== lastSavedSnapshot) {
      saveDraft()
    }
  }, 30000)
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
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
        <h1 class="text-lg font-semibold text-foreground">发布新闻</h1>
        <div class="flex items-center gap-2">
          <button
            @click="saveDraft()"
            :disabled="saving"
            class="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <Save :size="16" />
            <span>{{ saving ? '保存中...' : '存草稿' }}</span>
          </button>
          <button
            @click="publish"
            :disabled="publishing"
            class="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            <Send :size="16" />
            <span>{{ publishing ? '发布中...' : '发布' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="pt-14 pb-8">
      <div class="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div v-if="successMessage" class="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-sm px-4 py-2 rounded-lg">
          {{ successMessage }}
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">封面图片</label>
          <ImageUploader v-model="coverImage" />
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">标题</label>
          <input
            v-model="title"
            type="text"
            placeholder="请输入新闻标题"
            maxlength="100"
            class="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base"
          />
          <p class="text-xs text-muted-foreground mt-1 text-right">{{ title.length }}/100</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">分类</label>
          <select
            v-model="selectedCategory"
            class="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-base appearance-none"
          >
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">标签</label>
          <TagSelector v-model="selectedTags" />
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">正文</label>
          <TiptapEditor v-model="content" />
        </div>
      </div>
    </main>
  </div>
</template>
