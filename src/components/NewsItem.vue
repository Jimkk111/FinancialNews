<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { Clock } from 'lucide-vue-next'
import { formatViews } from '@/utils/format'

interface Props {
  id: number
  title: string
  source: string | null
  time: string
  views: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [id: number]
}>()
</script>

<template>
  <div class="nb-news-item" @click="emit('click', id)">
    <h3 class="nb-news-item__title">{{ title }}</h3>

    <div class="nb-news-item__meta">
      <span class="nb-news-item__source">{{ source }}</span>
      <span class="nb-news-item__dot">·</span>
      <span class="nb-news-item__time">
        <n-icon :component="Clock" :size="12" />
        {{ time }}
      </span>
      <span class="nb-news-item__views">{{ formatViews(views) }} 阅读</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.nb-news-item {
  padding: $sp-3 $sp-4;
  cursor: pointer;
  background-color: var(--nb-surface);
  border-bottom: 1px solid var(--nb-divider);
  transition: background-color $dur-fast $ease;

  &:hover {
    background-color: var(--nb-hover);
  }

  &:active {
    background-color: var(--nb-active);
  }

  &__title {
    font-size: $fs-lg;
    font-weight: $fw-semibold;
    line-height: 1.45;
    color: var(--nb-text);
    margin-bottom: $sp-2;
    @include line-clamp(2);
  }

  &__meta {
    @include flex(row, flex-start, center, $sp-1);
    font-size: $fs-xs;
    color: var(--nb-text-tertiary);
  }

  &__source {
    color: var(--nb-text-secondary);
    font-weight: $fw-medium;
    @include ellipsis;
    max-width: 40%;
  }

  &__dot {
    color: var(--nb-text-disabled);
  }

  &__time {
    @include flex(row, flex-start, center, 3px);
  }

  &__views {
    margin-left: auto;
    flex-shrink: 0;
  }
}
</style>
