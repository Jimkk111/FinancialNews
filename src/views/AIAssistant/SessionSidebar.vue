<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NIcon, NInput } from 'naive-ui'
import { MessageSquare, Search } from 'lucide-vue-next'
import { useAiSessionStore } from '@/stores/aiSession'
import SessionItem from './SessionItem.vue'

const store = useAiSessionStore()

const showDeleteDialog = ref(false)
const sessionToDelete = ref<string | null>(null)
const sessionTitleToDelete = ref('')

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
  <div class="sidebar">
    <div class="sidebar__search">
      <n-input
        v-model:value="localSearchQuery"
        size="small"
        placeholder="搜索会话..."
        clearable
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

    <div v-if="showDeleteDialog" class="sidebar__confirm">
      <div class="sidebar__confirm-card">
        <h3 class="sidebar__confirm-title">删除会话</h3>
        <p class="sidebar__confirm-text">
          确定要删除「{{ sessionTitleToDelete }}」吗？此操作无法撤销。
        </p>
        <div class="sidebar__confirm-actions">
          <n-button size="small" quaternary @click="showDeleteDialog = false">取消</n-button>
          <n-button size="small" type="error" secondary @click="executeDelete">删除</n-button>
        </div>
      </div>
    </div>
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

  &__confirm {
    position: fixed;
    inset: 0;
    z-index: $z-modal;
    @include flex(row, center, center);
    padding: $sp-4;
    background-color: var(--nb-overlay);
  }

  &__confirm-card {
    width: 100%;
    max-width: 320px;
    padding: $sp-5;
    background-color: var(--nb-surface);
    border: 1px solid var(--nb-border);
    border-radius: $radius-lg;
    box-shadow: var(--nb-shadow-md);
  }

  &__confirm-title {
    font-size: $fs-lg;
    font-weight: $fw-semibold;
    color: var(--nb-text);
    margin-bottom: $sp-2;
  }

  &__confirm-text {
    font-size: $fs-sm;
    line-height: $lh-relaxed;
    color: var(--nb-text-secondary);
  }

  &__confirm-actions {
    @include flex(row, flex-end, center, $sp-2);
    margin-top: $sp-5;
  }
}
</style>
