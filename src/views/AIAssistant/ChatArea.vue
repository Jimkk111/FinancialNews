<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { NIcon } from 'naive-ui'
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
  '新手如何理财？',
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
  const lastUserMessage = [...store.messages].reverse().find((m) => m.role === 'user')

  if (lastUserMessage) {
    store.messages = store.messages.filter((m) => m.id !== lastUserMessage.id)
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
  <div ref="scrollContainerRef" class="chat">
    <div class="chat__inner">
      <p v-if="store.error" class="nb-alert nb-alert--error chat__error">
        {{ store.error }}
      </p>

      <div v-if="store.hasMessages" class="chat__messages">
        <MessageBubble
          v-for="message in store.messages"
          :key="message.id"
          :message="message"
          @regenerate="handleRegenerate"
        />
      </div>

      <div v-else class="chat__welcome">
        <div class="chat__welcome-icon">
          <n-icon :component="Sparkles" :size="24" />
        </div>
        <h3 class="chat__welcome-title">Hello！我是您的 AI 助手</h3>
        <p class="chat__welcome-desc">请问有什么可以帮助您的？</p>

        <p class="chat__quick-label">快速提问</p>
        <div class="chat__quick">
          <button
            v-for="question in quickQuestions"
            :key="question"
            class="chat__quick-item"
            @click="handleQuickQuestion(question)"
          >
            {{ question }}
          </button>
        </div>
      </div>

      <div ref="messagesEndRef" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.chat {
  height: 100%;
  overflow-y: auto;

  &__inner {
    max-width: 720px;
    margin: 0 auto;
    padding: $sp-4;
  }

  &__error {
    margin-bottom: $sp-4;
  }

  &__messages {
    display: flex;
    flex-direction: column;
    gap: $sp-5;
  }

  &__welcome {
    @include flex(column, flex-start, center, $sp-2);
    padding-top: 16vh;
    text-align: center;
  }

  &__welcome-icon {
    @include flex(row, center, center);
    width: 56px;
    height: 56px;
    margin-bottom: $sp-2;
    border-radius: $radius-full;
    color: #fff;
    background-color: var(--nb-brand);
  }

  &__welcome-title {
    font-size: $fs-lg;
    font-weight: $fw-semibold;
    color: var(--nb-text);
  }

  &__welcome-desc {
    font-size: $fs-sm;
    color: var(--nb-text-secondary);
  }

  &__quick-label {
    align-self: flex-start;
    margin-top: $sp-6;
    margin-bottom: $sp-2;
    font-size: $fs-xs;
    color: var(--nb-text-tertiary);
  }

  &__quick {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $sp-2;
    width: 100%;
  }

  &__quick-item {
    padding: $sp-3;
    font-size: $fs-sm;
    text-align: left;
    color: var(--nb-text);
    background-color: var(--nb-surface);
    border: 1px solid var(--nb-border);
    border-radius: $radius-md;
    transition: background-color $dur-fast $ease, border-color $dur-fast $ease;

    &:hover {
      background-color: var(--nb-hover);
      border-color: var(--nb-border-strong);
    }

    &:active {
      background-color: var(--nb-active);
    }
  }
}
</style>
