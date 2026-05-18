<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import { useAiSessionStore } from '@/stores/aiSession'
import MessageBubble from './MessageBubble.vue'

const store = useAiSessionStore()
const messagesEndRef = ref<HTMLDivElement | null>(null)
const scrollContainerRef = ref<HTMLDivElement | null>(null)

const quickQuestions = [
  '今日A股行情如何？',
  '如何选择基金？',
  '什么是量化交易？',
  '新手如何理财？'
]

function scrollToBottom() {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

watch(
  () => store.messages.length,
  () => scrollToBottom()
)

watch(
  () => store.messages[store.messages.length - 1]?.content,
  () => scrollToBottom()
)

onMounted(() => {
  scrollToBottom()
})

function handleRegenerate() {
  const lastUserMessage = [...store.messages]
    .reverse()
    .find(m => m.role === 'user')
  
  if (lastUserMessage) {
    store.messages = store.messages.filter(
      m => m.id !== lastUserMessage.id
    )
    const lastAiMessage = store.messages[store.messages.length - 1]
    if (lastAiMessage && lastAiMessage.role === 'assistant') {
      store.messages = store.messages.slice(0, -1)
    }
    store.sendMessage(lastUserMessage.content)
  }
}

function handleQuickQuestion(question: string) {
  store.sendMessage(question)
}
</script>

<template>
  <div
    ref="scrollContainerRef"
    class="flex-1 overflow-y-auto pt-14 pb-44"
  >
    <div class="max-w-md mx-auto px-4 py-4">
      <div
        v-if="store.error"
        class="mb-4 p-3 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg text-sm"
      >
        {{ store.error }}
      </div>

      <template v-if="store.hasMessages">
        <div class="space-y-4">
          <TransitionGroup name="message">
            <MessageBubble
              v-for="message in store.messages"
              :key="message.id"
              :message="message"
              @regenerate="handleRegenerate"
            />
          </TransitionGroup>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col items-center mb-6 pt-[20vh]">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Sparkles :size="24" class="text-white" />
          </div>
          <h3 class="text-base font-semibold text-foreground mb-2">
            Hello！我是您的AI助手
          </h3>
          <p class="text-xs text-muted-foreground text-center">
            请问有什么可以帮助您的？
          </p>
        </div>

        <p class="text-xs text-muted-foreground mb-3 px-1">
          快速提问
        </p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="(question, index) in quickQuestions"
            :key="index"
            @click="handleQuickQuestion(question)"
            class="p-3 bg-card rounded-lg text-xs text-left text-foreground hover:bg-muted transition-colors border border-border active:scale-[0.98]"
          >
            {{ question }}
          </button>
        </div>
      </template>

      <div ref="messagesEndRef" />
    </div>
  </div>
</template>

<style scoped>
.message-enter-active {
  animation: messageSlideIn 0.2s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
