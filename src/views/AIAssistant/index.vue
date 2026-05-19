<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessageSquare, Plus, Loader2, Sparkles } from 'lucide-vue-next'
import { useAiSessionStore } from '@/stores/aiSession'
import BottomNav from '@/components/BottomNav.vue'
import ChatArea from './ChatArea.vue'
import InputArea from './InputArea.vue'
import SessionSidebar from './SessionSidebar.vue'

const router = useRouter()
const store = useAiSessionStore()

const handleTabChange = (tab: string) => {
  const routePath = tab === 'home' ? '/' : `/${tab}`
  router.push(routePath)
}

function handleSend(content: string) {
  store.sendMessage(content)
}

function handleNewConversation() {
  store.createNewSession()
}

onMounted(() => {
  store.init()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-muted">
    <header class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div class="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
        <button
          @click="store.toggleSidebar"
          class="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
        >
          <MessageSquare :size="20" />
        </button>

        <div class="flex items-center gap-2">
          <Sparkles :size="18" />
          <span class="font-medium">AI助手</span>
        </div>

        <button
          @click="handleNewConversation"
          :disabled="store.isLoading || store.isSending"
          class="p-2 -mr-2 hover:bg-white/20 rounded-full transition-colors active:scale-95 disabled:opacity-50"
        >
          <Loader2 v-if="store.isLoading" :size="18" class="animate-spin" />
          <Plus v-else :size="20" />
        </button>
      </div>
    </header>

    <Transition name="sidebar">
      <div
        v-if="store.sidebarOpen"
        class="fixed inset-0 z-40 bg-black/50"
        @click="store.closeSidebar"
      >
        <div
          class="absolute left-0 top-14 bottom-16 w-4/5 max-w-xs bg-card shadow-xl overflow-hidden"
          @click.stop
        >
          <SessionSidebar />
        </div>
      </div>
    </Transition>

    <main class="flex-1 flex flex-col overflow-hidden">
      <ChatArea />

      <div class="fixed bottom-16 left-0 right-0 z-30">
        <InputArea
          :disabled="!store.isServiceHealthy"
          :is-sending="store.isSending"
          :is-loading="store.isLoading"
          @send="handleSend"
        />
      </div>
    </main>

    <BottomNav active-tab="ai" @tab-change="handleTabChange" />
  </div>
</template>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: opacity 0.3s ease;
}

.sidebar-enter-active .absolute,
.sidebar-leave-active .absolute {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}

.sidebar-enter-from .absolute,
.sidebar-leave-to .absolute {
  transform: translateX(-100%);
}
</style>
