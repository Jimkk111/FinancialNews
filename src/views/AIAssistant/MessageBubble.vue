<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { NIcon } from 'naive-ui'
import { Copy, RefreshCw, Sparkles } from 'lucide-vue-next'
import { marked } from 'marked'
import type { Message } from '@/stores/aiSession'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  regenerate: []
}>()

const displayContent = ref('')

const renderedContent = computed(() => {
  return marked(displayContent.value) as string
})

const formattedTime = computed(() => {
  return props.message.timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

const isUser = computed(() => props.message.role === 'user')
const isStreaming = computed(() => props.message.status === 'streaming')

// 更新显示内容（流式时直接展示，流式本身就是渐进效果）
function updateDisplay() {
  displayContent.value = props.message.content
}

watch(
  () => props.message.content,
  () => {
    updateDisplay()
  }
)

watch(
  () => props.message.status,
  () => {
    updateDisplay()
  }
)

onMounted(() => {
  updateDisplay()
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
  <div class="bubble" :class="isUser ? 'bubble--user' : 'bubble--ai'">
    <div v-if="!isUser" class="bubble__avatar">
      <n-icon :component="Sparkles" :size="14" />
    </div>

    <div class="bubble__main">
      <div v-if="!isUser" class="bubble__name">AI 助手</div>

      <div class="bubble__content">
        <!-- AI 回复由 marked 渲染，内容来自后端模型输出 -->
        <div
          v-if="!isUser"
          class="nb-markdown"
          v-html="renderedContent"
        />
        <p v-else class="bubble__text">{{ message.content }}</p>

        <span v-if="isStreaming" class="bubble__cursor" />
      </div>

      <div class="bubble__footer">
        <span class="bubble__time">{{ formattedTime }}</span>

        <template v-if="!isUser && !isStreaming">
          <button class="bubble__action" title="复制" @click="copyContent">
            <n-icon :component="Copy" :size="13" />
          </button>
          <button class="bubble__action" title="重新生成" @click="handleRegenerate">
            <n-icon :component="RefreshCw" :size="13" />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.bubble {
  display: flex;
  gap: $sp-2;
  width: 100%;

  &--user {
    justify-content: flex-end;
  }

  &__avatar {
    flex-shrink: 0;
    @include flex(row, center, center);
    width: 26px;
    height: 26px;
    margin-top: 2px;
    border-radius: $radius-full;
    color: #fff;
    background-color: var(--nb-brand);
  }

  &__main {
    max-width: 85%;
    min-width: 0;

    .bubble--user & {
      max-width: 78%;
    }
  }

  &__name {
    margin-bottom: $sp-1;
    font-size: $fs-xs;
    color: var(--nb-text-tertiary);
  }

  &__content {
    padding: $sp-3 $sp-4;
    border-radius: $radius-lg;

    .bubble--ai & {
      background-color: var(--nb-surface);
      border: 1px solid var(--nb-border);
      border-top-left-radius: $radius-sm;
    }

    .bubble--user & {
      color: #fff;
      background-color: var(--nb-brand);
      border-top-right-radius: $radius-sm;
    }
  }

  &__text {
    font-size: $fs-base;
    line-height: $lh-relaxed;
    white-space: pre-line;
    word-break: break-word;
  }

  &__cursor {
    display: inline-block;
    width: 2px;
    height: 15px;
    margin-left: 2px;
    vertical-align: text-bottom;
    background-color: var(--nb-text);
    animation: bubble-blink 1s step-end infinite;
  }

  &__footer {
    @include flex(row, flex-start, center, $sp-1);
    margin-top: $sp-1;
    padding: 0 2px;

    .bubble--user & {
      justify-content: flex-end;
    }
  }

  &__time {
    font-size: 11px;
    color: var(--nb-text-tertiary);
  }

  &__action {
    @include flex(row, center, center);
    width: 20px;
    height: 20px;
    border-radius: $radius-sm;
    color: var(--nb-text-tertiary);
    transition: background-color $dur-fast $ease, color $dur-fast $ease;

    &:hover {
      background-color: var(--nb-hover);
      color: var(--nb-text);
    }
  }
}

@keyframes bubble-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
