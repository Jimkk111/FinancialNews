<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { useAiSessionStore } from '@/stores/aiSession'
import SessionItem from './SessionItem.vue'
import Button from '@/components/ui/Button.vue'

const store = useAiSessionStore()

const showDeleteDialog = ref(false)
const sessionToDelete = ref<string | null>(null)
const sessionTitleToDelete = ref('')

const localSearchQuery = computed({
  get: () => store.searchQuery,
  set: (value) => store.setSearchQuery(value)
})

function handleSelect(sessionId: string) {
  store.selectSession(sessionId)
}

function handleEdit(sessionId: string, title: string) {
  store.renameSession(sessionId, title)
}

function confirmDelete(sessionId: string, title: string) {
  sessionToDelete.value = sessionId
  sessionTitleToDelete.value = title
  showDeleteDialog.value = true
}

async function executeDelete() {
  if (sessionToDelete.value) {
    await store.removeSession(sessionToDelete.value)
    showDeleteDialog.value = false
    sessionToDelete.value = null
  }
}

function clearSearch() {
  localSearchQuery.value = ''
}
</script>

<template>
  <div class="h-full flex flex-col bg-card">
    <div class="p-3 border-b border-border">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          v-model="localSearchQuery"
          type="text"
          placeholder="搜索会话..."
          class="w-full pl-9 pr-8 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          v-if="localSearchQuery"
          @click="clearSearch"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded-full"
        >
          <X :size="14" class="text-muted-foreground" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-3">
      <p
        v-if="store.sessions.length === 0"
        class="text-xs text-muted-foreground text-center py-8"
      >
        暂无历史会话
      </p>

      <template v-else>
        <div
          v-for="group in store.groupedSessions"
          :key="group.key"
          class="mb-4"
        >
          <h3 class="text-xs font-medium text-muted-foreground mb-2 px-1">
            {{ group.label }}
          </h3>
          <div class="space-y-1">
            <SessionItem
              v-for="session in group.sessions"
              :key="session.sessionId"
              :session="session"
              :is-active="session.sessionId === store.currentSessionId"
              @select="handleSelect"
              @edit="handleEdit"
              @delete="(id) => confirmDelete(id, session.title || '未命名会话')"
            />
          </div>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <Transition name="dialog">
        <div
          v-if="showDeleteDialog"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          @click="showDeleteDialog = false"
        >
          <div
            class="bg-card border border-border rounded-lg p-6 max-w-sm mx-4 shadow-xl"
            @click.stop
          >
            <h3 class="text-lg font-semibold text-foreground">
              删除会话
            </h3>
            <p class="text-sm text-muted-foreground mt-2">
              确定要删除「{{ sessionTitleToDelete }}」吗？此操作无法撤销。
            </p>
            <div class="flex justify-end gap-2 mt-4">
              <Button
                variant="ghost"
                @click="showDeleteDialog = false"
              >
                取消
              </Button>
              <Button
                variant="destructive"
                @click="executeDelete"
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active > div,
.dialog-leave-active > div {
  transition: transform 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div,
.dialog-leave-to > div {
  transform: scale(0.95);
}
</style>
