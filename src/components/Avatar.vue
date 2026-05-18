<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  src?: string
  alt?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Avatar'
})

const emit = defineEmits<{
  error: []
}>()

const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
  emit('error')
}

const showImage = computed(() => props.src && !imageError.value)
</script>

<template>
  <span
    data-slot="avatar"
    :class="[
      'relative flex shrink-0 overflow-hidden rounded-full',
      'size-10',
      props.class
    ]"
  >
    <img
      v-if="showImage"
      :src="src"
      :alt="alt"
      data-slot="avatar-image"
      class="aspect-square size-full object-cover"
      loading="lazy"
      decoding="async"
      @error="handleImageError"
    />
    <span
      v-else
      data-slot="avatar-fallback"
      class="flex size-full items-center justify-center rounded-full bg-muted"
    >
      <slot />
    </span>
  </span>
</template>
