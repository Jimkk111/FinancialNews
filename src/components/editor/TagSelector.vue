<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import { getTags } from '@/api/news'
import type { Tag } from '@/types'

interface Props {
  modelValue: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const tags = ref<Tag[]>([])

const loadTags = async () => {
  try {
    tags.value = await getTags()
  } catch {
    // 加载失败时保持空数组
  }
}

onMounted(() => {
  loadTags()
})

const selectedTags = computed<Tag[]>(() => {
  return props.modelValue
    .map(id => tags.value.find((t: Tag) => t.id === id))
    .filter((t): t is Tag => t !== undefined)
})

const availableTags = computed<Tag[]>(() => {
  return tags.value.filter((t: Tag) => !props.modelValue.includes(t.id))
})

const addTag = (tagId: number) => {
  if (!props.modelValue.includes(tagId)) {
    emit('update:modelValue', [...props.modelValue, tagId])
  }
}

const removeTag = (tagId: number) => {
  emit('update:modelValue', props.modelValue.filter(id => id !== tagId))
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap gap-2">
      <span
        v-for="tag in selectedTags"
        :key="tag.id"
        class="inline-flex items-center gap-1 px-3 py-1.5 bg-brand/10 text-brand text-sm rounded-full"
      >
        #{{ tag.name }}
        <button
          @click="removeTag(tag.id)"
          class="w-4 h-4 flex items-center justify-center hover:bg-brand/20 rounded-full"
        >
          <X :size="12" />
        </button>
      </span>

      <span class="text-sm text-gray-400" v-if="selectedTags.length === 0">
        未选择标签
      </span>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tag in availableTags"
        :key="tag.id"
        @click="addTag(tag.id)"
        class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
      >
        + {{ tag.name }}
      </button>
    </div>
  </div>
</template>
