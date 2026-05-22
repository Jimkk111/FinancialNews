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
  <div class="sticky top-14 z-40 bg-background border-b border-border">
    <div class="flex overflow-x-auto px-4 py-3 gap-6 scrollbar-hide">
      <button
        :class="[
          'whitespace-nowrap text-[15px] transition-colors relative pb-1',
          activeCategory === null ? 'text-brand font-bold' : 'text-muted-foreground'
        ]"
        @click="handleCategoryClick(null)"
      >
        全部
        <div v-if="activeCategory === null" class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
      </button>

      <button
        v-for="category in categories"
        :key="category.id"
        :class="[
          'whitespace-nowrap text-[15px] transition-colors relative pb-1',
          activeCategory === category.id ? 'text-brand font-bold' : 'text-muted-foreground'
        ]"
        @click="handleCategoryClick(category.id)"
      >
        {{ category.name }}
        <div v-if="activeCategory === category.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
      </button>
    </div>
  </div>
</template>
