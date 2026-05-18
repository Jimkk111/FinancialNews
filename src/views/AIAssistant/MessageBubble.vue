<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Sparkles, Copy, RefreshCw, Check } from 'lucide-vue-next'
import { marked } from 'marked'
import type { Message } from '@/stores/aiSession'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  regenerate: []
}>()

const displayContent = ref('')
const typingSpeed = 30 // 打字速度（毫秒/字符）

const renderedContent = computed(() => {
  return marked(displayContent.value) as string
})

const formattedTime = computed(() => {
  return props.message.timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const isUser = computed(() => props.message.role === 'user')
const isStreaming = computed(() => props.message.status === 'streaming')

// 打字机效果
function startTyping() {
  if (!isStreaming.value) {
    displayContent.value = props.message.content
    return
  }

  displayContent.value = ''
  let index = 0
  const content = props.message.content
  
  const typingInterval = setInterval(() => {
    if (index < content.length) {
      displayContent.value = content.substring(0, index + 1)
      index++
    } else {
      clearInterval(typingInterval)
    }
  }, typingSpeed)
}

// 监听消息内容变化，重新开始打字
watch(
  () => props.message.content,
  () => {
    startTyping()
  },
  { deep: true }
)

watch(
  () => props.message.status,
  () => {
    startTyping()
  }
)

onMounted(() => {
  startTyping()
})

async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.message.content)
  } catch {
    // 复制失败静默处理
  }
}

function handleRegenerate() {
  emit('regenerate')
}
</script>

<template>
  <div
    :class="[
      'flex w-full',
      isUser ? 'justify-end' : 'justify-start'
    ]"
  >
    <div
      :class="[
        'max-w-[85%]',
        isUser ? 'order-2' : 'order-1'
      ]"
    >
      <div
        v-if="!isUser"
        class="flex items-center gap-2 mb-2"
      >
        <div class="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles :size="14" class="text-white" />
        </div>
        <span class="text-xs text-muted-foreground">AI助手</span>
      </div>

      <div
        :class="[
          'px-4 py-3 rounded-2xl',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-card text-foreground rounded-tl-sm shadow-sm border border-border'
        ]"
      >
        <div
          v-if="!isUser"
          class="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5"
          v-html="renderedContent"
        />
        <p
          v-else
          class="text-sm whitespace-pre-line leading-relaxed"
        >
          {{ message.content }}
        </p>

        <span
          v-if="isStreaming"
          class="inline-block w-2 h-4 bg-foreground animate-pulse ml-1 streaming-cursor"
        />
      </div>

      <div
        :class="[
          'flex items-center gap-2 mt-1 px-1',
          isUser ? 'justify-end' : 'justify-start'
        ]"
      >
        <span class="text-xs text-muted-foreground">
          {{ formattedTime }}
        </span>

        <template v-if="!isUser && !isStreaming">
          <button
            @click="copyContent"
            class="p-1 hover:bg-muted rounded transition-colors"
            title="复制"
          >
            <Copy :size="12" class="text-muted-foreground" />
          </button>
          <button
            @click="handleRegenerate"
            class="p-1 hover:bg-muted rounded transition-colors"
            title="重新生成"
          >
            <RefreshCw :size="12" class="text-muted-foreground" />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose :deep(p) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.prose :deep(ul),
.prose :deep(ol) {
  padding-left: 1rem;
}

.prose :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.dark .prose :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
}

.prose :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.dark .prose :deep(pre) {
  background-color: rgba(255, 255, 255, 0.05);
}

.streaming-cursor::after {
  content: '▊';
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
