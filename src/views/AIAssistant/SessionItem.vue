<script setup lang="ts">
import { ref, computed, h, type Component } from 'vue'
import { NDropdown, NIcon, type DropdownOption } from 'naive-ui'
import { MessageSquare, MoreVertical, Pencil, Trash2 } from 'lucide-vue-next'
import type { SessionInfo } from '@/types'

const props = defineProps<{
  session: SessionInfo
  isActive: boolean
}>()

const emit = defineEmits<{
  select: [sessionId: string]
  edit: [sessionId: string, title: string]
  delete: [sessionId: string]
}>()

const isEditing = ref(false)
const editTitle = ref('')
const showMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)

const formattedTime = computed(() => {
  const date = new Date(props.session.updatedAt)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})

const renderIcon = (icon: Component) => () =>
  h(NIcon, null, { default: () => h(icon) })

const menuOptions: DropdownOption[] = [
  { label: '重命名', key: 'edit', icon: renderIcon(Pencil) },
  { label: '删除', key: 'delete', icon: renderIcon(Trash2) },
]

function handleSelect() {
  if (!isEditing.value) {
    emit('select', props.session.sessionId)
  }
}

function startEdit() {
  editTitle.value = props.session.title || '未命名会话'
  isEditing.value = true
}

function saveEdit() {
  if (editTitle.value.trim()) {
    emit('edit', props.session.sessionId, editTitle.value.trim())
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function toggleMenu(e: MouseEvent) {
  e.stopPropagation()
  showMenu.value = !showMenu.value
  menuX.value = e.clientX
  menuY.value = e.clientY
}

function closeMenu() {
  showMenu.value = false
}

function handleMenuSelect(key: string) {
  closeMenu()
  if (key === 'edit') {
    startEdit()
  } else if (key === 'delete') {
    emit('delete', props.session.sessionId)
  }
}
</script>

<template>
  <div class="session-item">
    <div
      class="session-item__row"
      :class="{ 'is-active': isActive }"
      @click="handleSelect"
    >
      <div v-if="isEditing" class="session-item__edit" @click.stop>
        <input
          v-model="editTitle"
          class="session-item__input"
          type="text"
          autofocus
          @keypress.enter="saveEdit"
          @keydown.esc="cancelEdit"
        />
        <button class="session-item__link" @click="saveEdit">保存</button>
        <button class="session-item__link session-item__link--muted" @click="cancelEdit">
          取消
        </button>
      </div>

      <template v-else>
        <div class="session-item__body">
          <div class="session-item__title-row">
            <n-icon :component="MessageSquare" :size="14" />
            <h4 class="session-item__title">{{ session.title || '未命名会话' }}</h4>
          </div>
          <span class="session-item__time">{{ formattedTime }}</span>
        </div>

        <button
          class="session-item__more"
          title="更多操作"
          @click.stop="toggleMenu"
        >
          <n-icon :component="MoreVertical" :size="15" />
        </button>
      </template>
    </div>

    <n-dropdown
      trigger="manual"
      placement="bottom-start"
      :x="menuX"
      :y="menuY"
      :options="menuOptions"
      :show="showMenu"
      @clickoutside="closeMenu"
      @select="handleMenuSelect"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.session-item {
  &__row {
    @include flex(row, space-between, center, $sp-2);
    padding: $sp-2 $sp-3;
    border-radius: $radius-md;
    cursor: pointer;
    color: var(--nb-text);
    transition: background-color $dur-fast $ease;

    &:hover {
      background-color: var(--nb-hover);
    }

    &.is-active {
      background-color: var(--nb-brand-subtle);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title-row {
    @include flex(row, flex-start, center, $sp-2);
    min-width: 0;
  }

  &__title {
    font-size: $fs-base;
    font-weight: $fw-medium;
    color: var(--nb-text);
    @include ellipsis;
  }

  &__time {
    display: block;
    margin-top: 2px;
    margin-left: 22px;
    font-size: $fs-xs;
    color: var(--nb-text-tertiary);
  }

  &__more {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: $radius-md;
    color: var(--nb-text-tertiary);
    transition: background-color $dur-fast $ease, color $dur-fast $ease;

    &:hover {
      background-color: var(--nb-active);
      color: var(--nb-text);
    }
  }

  &__edit {
    @include flex(row, flex-start, center, $sp-1);
    width: 100%;
  }

  &__input {
    flex: 1;
    min-width: 0;
    padding: 3px $sp-2;
    font-size: $fs-sm;
    color: var(--nb-text);
    background-color: var(--nb-bg);
    border: 1px solid var(--nb-border-strong);
    border-radius: $radius-sm;
    outline: none;

    &:focus {
      border-color: var(--nb-brand);
    }
  }

  &__link {
    flex-shrink: 0;
    font-size: $fs-xs;
    color: var(--nb-brand);
    padding: 0 2px;

    &:hover {
      text-decoration: underline;
    }

    &--muted {
      color: var(--nb-text-tertiary);

      &:hover {
        color: var(--nb-text-secondary);
      }
    }
  }
}
</style>
