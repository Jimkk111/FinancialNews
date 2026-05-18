<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Send, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  disabled: boolean
  isSending: boolean
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

function handleSend() {
  if (inputValue.value.trim() && !props.disabled && !props.isSending) {
    emit('send', inputValue.value)
    inputValue.value = ''
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
      }
    })
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="bg-card border-t border-border">
    <div class="px-4 py-3">
      <div class="flex items-end gap-2">
        <div class="flex-1 bg-muted rounded-2xl px-4 py-2">
          <textarea
            ref="textareaRef"
            v-model="inputValue"
            :placeholder="disabled ? '后端服务不可用' : '输入您的问题...'"
            :disabled="disabled || isSending"
            class="w-full bg-transparent text-sm resize-none outline-none max-h-24 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            rows="1"
            style="line-height: 1.5"
            @keydown="handleKeydown"
          />
        </div>
        <button
          @click="handleSend"
          :disabled="!inputValue.trim() || disabled || isSending"
          :class="[
            'p-2.5 rounded-full transition-all active:scale-95',
            inputValue.trim() && !disabled && !isSending
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
              : 'bg-muted text-muted-foreground'
          ]"
        >
          <Loader2 v-if="isSending" :size="18" class="animate-spin" />
          <Send v-else :size="18" />
        </button>
      </div>
      <p class="text-xs text-muted-foreground mt-2 text-center">
        AI助手可能会出错，请谨慎对待投资建议
      </p>
    </div>
  </div>
</template>
