<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useNewsCategoryStore } from '@/stores/newsCategory'

const store = useNewsCategoryStore()

const scrollerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  void store.fetchCategories()
})

const handleCategoryClick = (categoryId: number | null) => {
  store.switchTo(categoryId)
}

// 切换分类后让高亮 tab 滚到可视区中间（分类多时 tab 条自身横向滚动）。
// block: 'nearest' 必须保留，否则可能带动整页竖滚
watch(() => store.activeCategoryId, async () => {
  await nextTick()
  scrollerRef.value
    ?.querySelector('.nb-tabs__item.is-active')
    ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
})
</script>

<template>
  <div class="nb-tabs">
    <div ref="scrollerRef" class="nb-tabs__scroller">
      <button
        v-for="category in store.items"
        :key="category.id ?? 'all'"
        class="nb-tabs__item"
        :class="{ 'is-active': store.activeCategoryId === category.id }"
        @click="handleCategoryClick(category.id)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.nb-tabs {
  border-bottom: 1px solid var(--nb-border);

  &__scroller {
    display: flex;
    gap: $sp-1;
    padding: $sp-2 $sp-4;
    overflow-x: auto;
    @include hide-scrollbar;
  }

  &__item {
    flex-shrink: 0;
    padding: $sp-1 $sp-3;
    font-size: $fs-base;
    line-height: 1.4;
    color: var(--nb-text-secondary);
    white-space: nowrap;
    border-radius: $radius-md;
    transition: background-color $dur-fast $ease, color $dur-fast $ease;

    &:hover {
      background-color: var(--nb-hover);
      color: var(--nb-text);
    }

    &.is-active {
      color: var(--nb-brand);
      font-weight: $fw-medium;
      background-color: var(--nb-brand-subtle);
    }
  }
}
</style>
