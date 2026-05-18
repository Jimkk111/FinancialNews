<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, FileText, Edit, Trash2 } from 'lucide-vue-next'
import { getDraftsList, deleteDraftService } from '@/services/newsEditorService'
import { formatTime } from '@/utils/format'
import type { NewsDraft } from '@/types'

const router = useRouter()

const handleBack = () => {
  router.push('/profile')
}

const handleEdit = (id: string) => {
  router.push({ path: '/editor', query: { draftId: id } })
}

const drafts = ref<NewsDraft[]>([])
const loading = ref(true)

const loadDrafts = async () => {
  loading.value = true
  const response = await getDraftsList()
  if (response.success && response.data) {
    drafts.value = response.data
  }
  loading.value = false
}

const handleDelete = async (id: string) => {
  const response = await deleteDraftService(id)
  if (response.success) {
    loadDrafts()
  }
}

onMounted(() => {
  loadDrafts()
})
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
        <h1 class="text-lg font-semibold text-foreground">草稿箱</h1>
        <div class="w-10"></div>
      </div>
    </header>

    <main class="pt-14 pb-4 px-4 max-w-md mx-auto">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-muted-foreground">加载中...</div>
      </div>

      <div v-else-if="drafts.length === 0" class="flex flex-col items-center justify-center py-12">
        <FileText :size="48" class="text-muted-foreground/50 mb-4" />
        <p class="text-muted-foreground">暂无草稿</p>
      </div>

      <div v-else class="space-y-3 pt-4">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="bg-card rounded-xl p-4 shadow-sm border border-border"
        >
          <div class="flex gap-3">
            <div
              v-if="draft.coverImage"
              class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
            >
              <img
                :src="draft.coverImage"
                :alt="draft.title"
                class="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div
              v-else
              class="w-20 h-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center"
            >
              <FileText :size="24" class="text-muted-foreground" />
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="text-base font-medium text-foreground line-clamp-2 mb-1">
                {{ draft.title || '无标题' }}
              </h3>
              <p class="text-xs text-muted-foreground mb-2">
                {{ formatTime(draft.updatedAt) }}
              </p>
              <div class="flex items-center gap-2">
                <button
                  @click="handleEdit(draft.id)"
                  class="flex items-center gap-1 px-3 py-1 text-xs text-brand hover:bg-brand/10 rounded-lg transition-colors"
                >
                  <Edit :size="12" />
                  <span>继续编辑</span>
                </button>
                <button
                  @click="handleDelete(draft.id)"
                  class="flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                >
                  <Trash2 :size="12" />
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
