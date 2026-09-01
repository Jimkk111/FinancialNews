<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { NIcon, NSpin } from 'naive-ui'
import { Send } from 'lucide-vue-next'

const props = defineProps<{
  disabled: boolean
  isSending: boolean
  isLoading: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const inputValue = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function adjustHeight() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 96)}px`
    }
  })
}

watch(inputValue, adjustHeight)

const canSend = () =>
  inputValue.value.trim() && !props.disabled && !props.isSending && !props.isLoading

function handleSend() {
  if (!canSend()) return
  emit('send', inputValue.value)
  inputValue.value = ''
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="composer">
    <div class="composer__inner">
      <div class="composer__box" :class="{ 'is-disabled': disabled }">
        <textarea
          ref="textareaRef"
          v-model="inputValue"
          class="composer__textarea"
          rows="1"
          :placeholder="disabled ? '后端服务不可用' : '输入您的问题...'"
          :disabled="disabled || isSending || isLoading"
          @keydown="handleKeydown"
        />

        <button
          class="composer__send"
          :class="{ 'is-ready': canSend() }"
          title="发送"
          :disabled="!canSend()"
          @click="handleSend"
        >
          <n-spin v-if="isSending" size="small" />
          <n-icon v-else :component="Send" :size="17" />
        </button>
      </div>

      <p class="composer__tip">AI 助手可能会出错，请谨慎对待投资建议</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.composer {
  background-color: var(--nb-bg);
  border-top: 1px solid var(--nb-border);

  &__inner {
    max-width: 720px;
    margin: 0 auto;
    padding: $sp-3 $sp-4 $sp-2;
  }

  &__box {
    @include flex(row, flex-start, flex-end, $sp-2);
    padding: $sp-2 $sp-2 $sp-2 $sp-3;
    background-color: var(--nb-surface);
    border: 1px solid var(--nb-border-strong);
    border-radius: $radius-lg;
    transition: border-color $dur-base $ease, box-shadow $dur-base $ease;

    &:focus-within {
      border-color: var(--nb-brand);
      box-shadow: 0 0 0 3px var(--nb-brand-subtle);
    }

    &.is-disabled {
      opacity: 0.6;
    }
  }

  &__textarea {
    flex: 1;
    min-width: 0;
    max-height: 96px;
    padding: 4px 0;
    font-size: $fs-base;
    line-height: 1.5;
    color: var(--nb-text);
    background: transparent;
    border: none;
    outline: none;
    resize: none;

    &::placeholder {
      color: var(--nb-text-tertiary);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__send {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: $radius-md;
    color: var(--nb-text-tertiary);
    background-color: var(--nb-surface-subtle);
    transition: background-color $dur-fast $ease, color $dur-fast $ease;

    &.is-ready {
      color: #fff;
      background-color: var(--nb-brand);

      &:hover {
        background-color: var(--nb-brand-hover);
      }
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__tip {
    margin-top: $sp-2;
    text-align: center;
    font-size: 11px;
    color: var(--nb-text-tertiary);
  }
}
</style>
