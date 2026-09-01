<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getNewsCategories } from '@/services/newsService'

interface Category {
  id: number
  name: string
}

const categories = ref<Category[]>([])
const activeCategory = ref<number | null>(null)
const loading = ref(true)

const emit = defineEmits<{
  categoryChange: [categoryId: number | null]
}>()

const fetchCategories = async () => {
  try {
    loading.value = true
    const response = await getNewsCategories()
    categories.value = (response as any).data ?? response
  } catch (error) {
    // 静默处理错误，保持 UI 稳定性
  } finally {
    loading.value = false
  }
}

const handleCategoryClick = (categoryId: number | null) => {
  activeCategory.value = categoryId
  emit('categoryChange', categoryId)
}

onMounted(fetchCategories)
</script>

<template>
  <div class="nb-tabs">
    <div class="nb-tabs__scroller">
      <button
        class="nb-tabs__item"
        :class="{ 'is-active': activeCategory === null }"
        @click="handleCategoryClick(null)"
      >
        全部
      </button>

      <button
        v-for="category in categories"
        :key="category.id"
        class="nb-tabs__item"
        :class="{ 'is-active': activeCategory === category.id }"
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
