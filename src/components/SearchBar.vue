<script setup lang="ts">
import { ref } from 'vue'
import { NIcon } from 'naive-ui'
import { Search } from 'lucide-vue-next'

const keyword = ref('')

const emit = defineEmits<{
  search: [keyword: string]
}>()

const handleSearch = () => {
  if (keyword.value.trim()) {
    emit('search', keyword.value.trim())
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <div class="nb-search">
    <n-icon class="nb-search__icon" :component="Search" :size="16" />
    <input
      v-model="keyword"
      type="text"
      class="nb-search__input"
      placeholder="搜索新闻、主题或关键词"
      @keypress="handleKeyPress"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.nb-search {
  position: relative;
  display: flex;
  align-items: center;

  &__icon {
    position: absolute;
    left: $sp-3;
    color: var(--nb-text-tertiary);
    pointer-events: none;
  }

  &__input {
    width: 100%;
    height: 36px;
    padding: 0 $sp-3 0 34px;
    font-size: $fs-base;
    color: var(--nb-text);
    background-color: var(--nb-surface-subtle);
    border: 1px solid transparent;
    border-radius: $radius-md;
    transition: background-color $dur-base $ease, border-color $dur-base $ease;

    &::placeholder {
      color: var(--nb-text-tertiary);
    }

    &:focus {
      outline: none;
      background-color: var(--nb-surface);
      border-color: var(--nb-border-strong);
    }
  }
}
</style>
