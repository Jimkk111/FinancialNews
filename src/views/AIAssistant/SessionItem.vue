<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessageSquare, Pencil, Trash2, MoreVertical } from 'lucide-vue-next'
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

const showActions = ref(false)
const isEditing = ref(false)
const editTitle = ref('')
const showMenu = ref(false)
const menuTriggerRef = ref<HTMLElement | null>(null)

const formattedTime = computed(() => {
  const date = new Date(props.session.updatedAt)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})

const menuPosition = computed(() => {
  if (!menuTriggerRef.value) {
    return { top: '0px', left: '0px' }
  }
  
  const rect = menuTriggerRef.value.getBoundingClientRect()
  const menuWidth = 120
  const menuHeight = 80
  
  let left = rect.right - menuWidth
  let top = rect.bottom + 4
  
  if (left + menuWidth > window.innerWidth) {
    left = window.innerWidth - menuWidth - 8
  }
  if (top + menuHeight > window.innerHeight) {
    top = rect.top - menuHeight - 4
  }
  
  return {
    top: `${top}px`,
    left: `${left}px`
  }
})

function handleSelect() {
  if (!isEditing.value) {
    emit('select', props.session.sessionId)
  }
}

function startEdit() {
  editTitle.value = props.session.title || '未命名会话'
  isEditing.value = true
  showMenu.value = false
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

function handleDelete() {
  showMenu.value = false
  emit('delete', props.session.sessionId)
}

function toggleMenu(e: Event) {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}

function closeMenu() {
  showMenu.value = false
}
</script>

<template>
  <div
    class="relative overflow-hidden"
    @touchstart="showActions = false"
    @touchmove="showActions = true"
    @touchend="showActions = false"
  >
    <div
      :class="[
        'p-3 rounded-lg transition-all duration-150 active:scale-[0.98]',
        isActive ? 'bg-accent' : 'bg-muted hover:bg-accent'
      ]"
      @click="handleSelect"
    >
      <div v-if="isEditing" class="flex items-center gap-2" @click.stop>
        <input
          v-model="editTitle"
          type="text"
          class="flex-1 text-sm font-medium text-foreground bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keypress.enter="saveEdit"
          @keypress.escape="cancelEdit"
          autofocus
        />
        <button
          @click="saveEdit"
          class="text-xs text-blue-600 hover:underline px-1"
        >
          保存
        </button>
        <button
          @click="cancelEdit"
          class="text-xs text-muted-foreground hover:underline px-1"
        >
          取消
        </button>
      </div>
      
      <template v-else>
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <MessageSquare :size="14" class="text-muted-foreground flex-shrink-0" />
              <h4 class="text-sm font-medium text-foreground truncate">
                {{ session.title || '未命名会话' }}
              </h4>
            </div>
            <span class="text-xs text-muted-foreground ml-5">
              {{ formattedTime }}
            </span>
          </div>
          
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              ref="menuTriggerRef"
              @click="toggleMenu"
              class="p-1.5 hover:bg-background rounded-full transition-colors"
            >
              <MoreVertical :size="16" class="text-muted-foreground" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <Transition name="menu">
        <div
          v-if="showMenu"
          class="fixed inset-0 z-[100]"
          @click="closeMenu"
        >
          <div
            class="absolute bg-card border border-border rounded-lg shadow-xl py-1 min-w-[120px]"
            :style="menuPosition"
            @click.stop
          >
            <button
              @click="startEdit"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Pencil :size="14" />
              <span>编辑</span>
            </button>
            <button
              @click="handleDelete"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 :size="14" />
              <span>删除</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s ease;
}

.menu-enter-active > div,
.menu-leave-active > div {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

.menu-enter-from > div,
.menu-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
