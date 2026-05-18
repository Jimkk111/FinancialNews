<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus, X } from 'lucide-vue-next'
import { uploadImage } from '@/services/newsEditorService'

interface Props {
  modelValue: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const isUploading = ref(false)
const error = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const handleClick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  error.value = ''
  isUploading.value = true

  const response = await uploadImage(file)
  
  if (response.success && response.data) {
    emit('update:modelValue', response.data.url)
  } else {
    error.value = response.error?.message || '上传失败'
  }

  isUploading.value = false
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleRemove = () => {
  emit('update:modelValue', null)
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (!file) return

  error.value = ''
  isUploading.value = true

  const response = await uploadImage(file)
  
  if (response.success && response.data) {
    emit('update:modelValue', response.data.url)
  } else {
    error.value = response.error?.message || '上传失败'
  }

  isUploading.value = false
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}
</script>

<template>
  <div class="relative">
    <div
      v-if="!modelValue"
      class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
      :class="{ 'border-brand bg-red-50': isUploading }"
      @click="handleClick"
      @drop="handleDrop"
      @dragover="handleDragOver"
    >
      <div v-if="isUploading" class="flex flex-col items-center">
        <div class="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-2" />
        <span class="text-sm text-gray-500">上传中...</span>
      </div>
      <div v-else class="flex flex-col items-center">
        <ImagePlus :size="32" class="text-gray-400 mb-2" />
        <span class="text-sm text-gray-500">点击或拖拽上传封面图</span>
        <span class="text-xs text-gray-400 mt-1">支持 PNG、JPEG、GIF、WebP，最大 5MB</span>
      </div>
    </div>

    <div v-else class="relative rounded-xl overflow-hidden">
      <img :src="modelValue" alt="封面图" class="w-full h-48 object-cover" loading="lazy" decoding="async" />
      <button
        @click="handleRemove"
        class="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <X :size="16" class="text-white" />
      </button>
      <button
        @click="handleClick"
        class="absolute bottom-2 right-2 px-3 py-1.5 bg-black/50 rounded-lg text-white text-sm hover:bg-black/70 transition-colors"
      >
        更换图片
      </button>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
      class="hidden"
      @change="handleFileChange"
    />

    <p v-if="error" class="text-xs text-red-500 mt-2">{{ error }}</p>
  </div>
</template>
