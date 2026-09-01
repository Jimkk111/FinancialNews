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
  <div class="qa-container">
    <div class="qa-head">
      <div class="qa-avatar">
        <Sparkles :size="24" />
      </div>
      <h3 class="qa-title">Hello！我是您的AI助手</h3>
      <p class="qa-sub">请问有什么可以帮助您的？</p>
    </div>

    <p class="qa-label">快速提问</p>
    <div class="qa-grid">
      <button
        v-for="(question, index) in quickQuestions"
        :key="index"
        class="qa-card"
        @click="handleSelect(question)"
      >
        {{ question }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.qa-container {
  max-width: 28rem;
  margin: 1.5rem auto 0;
  padding: 0 1rem;
}

.qa-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.qa-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #fff;
  background: linear-gradient(135deg, var(--nb-primary), #9333ea);
}

.qa-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--nb-text);
  margin-bottom: 0.5rem;
}

.qa-sub {
  font-size: 0.8125rem;
  color: var(--nb-text-secondary);
  text-align: center;
}

.qa-label {
  font-size: 0.8125rem;
  color: var(--nb-text-secondary);
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.qa-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.qa-card {
  padding: 0.75rem;
  background: var(--nb-bg);
  border: 1px solid var(--nb-border);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  text-align: left;
  color: var(--nb-text);
  transition: background-color 0.15s ease, transform 0.1s ease;

  &:hover {
    background: var(--nb-hover);
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
