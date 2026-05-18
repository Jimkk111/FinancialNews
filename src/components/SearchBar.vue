<script setup lang="ts">
import { ref } from 'vue'
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
  <div class="w-full px-4 pb-3">
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" :size="18" />
      <input
        type="text"
        placeholder="搜索金融资讯..."
        v-model="keyword"
        @keypress="handleKeyPress"
        class="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:bg-accent transition-colors"
      />
    </div>
  </div>
</template>
