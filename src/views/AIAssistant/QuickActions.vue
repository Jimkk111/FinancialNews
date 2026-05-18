<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

const quickQuestions = [
  '今日A股行情如何？',
  '如何选择基金？',
  '什么是量化交易？',
  '新手如何理财？'
]

const emit = defineEmits<{
  select: [question: string]
}>()

function handleSelect(question: string) {
  emit('select', question)
}
</script>

<template>
  <div class="max-w-md mx-auto mt-6 px-4">
    <div class="flex flex-col items-center mb-6">
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
        @click="handleSelect(question)"
        class="p-3 bg-card rounded-lg text-xs text-left text-foreground hover:bg-muted transition-colors border border-border active:scale-[0.98]"
      >
        {{ question }}
      </button>
    </div>
  </div>
</template>
