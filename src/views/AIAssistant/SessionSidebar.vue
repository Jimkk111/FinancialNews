<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NIcon, NInput, NModal } from 'naive-ui'
import { MessageSquare, Search } from 'lucide-vue-next'
import { useAiSessionStore } from '@/stores/aiSession'
import SessionItem from './SessionItem.vue'

const store = useAiSessionStore()

const showDeleteDialog = ref(false)
const sessionToDelete = ref<string | null>(null)
const sessionTitleToDelete = ref('')
const deleting = ref(false)

const localSearchQuery = computed({
  get: () => store.searchQuery,
  set: (value) => store.setSearchQuery(value),
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
  if (!sessionToDelete.value || deleting.value) return false
  deleting.value = true
  const success = await store.removeSession(sessionToDelete.value)
  deleting.value = false
  if (!success) return false
  sessionToDelete.value = null
}

function clearSearch() {
  localSearchQuery.value = ''
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar__search">
      <n-input
        v-model:value="localSearchQuery"
        size="small"
        placeholder="搜索会话..."
        clearable
        @clear="clearSearch"
      >
        <template #prefix>
          <n-icon :component="Search" :size="15" />
        </template>
      </n-input>
    </div>

    <div class="sidebar__list">
      <div v-if="store.sessions.length === 0" class="sidebar__empty">
        <n-icon :component="MessageSquare" :size="30" />
        <p>暂无历史会话</p>
      </div>

      <div v-else-if="store.groupedSessions.length === 0" class="sidebar__empty">
        <n-icon :component="Search" :size="30" />
        <p>未找到匹配的会话</p>
      </div>

      <div v-for="group in store.groupedSessions" :key="group.key" class="sidebar__group">
        <h3 class="sidebar__group-title">{{ group.label }}</h3>
        <div class="sidebar__group-list">
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
    </div>

    <n-modal
      v-model:show="showDeleteDialog"
      preset="dialog"
      type="warning"
      title="删除会话"
      :content="`确定要删除「${sessionTitleToDelete}」吗？此操作无法撤销。`"
      positive-text="删除"
      negative-text="取消"
      :positive-button-props="{ type: 'error' }"
      :loading="deleting"
      @positive-click="executeDelete"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--nb-surface);

  &__search {
    padding: $sp-3;
    border-bottom: 1px solid var(--nb-divider);
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: $sp-3;
  }

  &__empty {
    @include flex(column, center, center, $sp-2);
    padding: $sp-10 0;
    font-size: $fs-sm;
    color: var(--nb-text-tertiary);
  }

  &__group {
    margin-bottom: $sp-5;
  }

  &__group-title {
    margin: 0 0 $sp-2 $sp-2;
    font-size: $fs-xs;
    font-weight: $fw-medium;
    color: var(--nb-text-tertiary);
  }

  &__group-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}
</style>
