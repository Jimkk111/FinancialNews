<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  src?: string
  alt?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Avatar',
  size: 40,
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
  <span class="nb-avatar" :style="{ width: `${size}px`, height: `${size}px` }">
    <img
      v-if="showImage"
      :src="src"
      :alt="alt"
      class="nb-avatar__img"
      loading="lazy"
      decoding="async"
      @error="handleImageError"
    />
    <span v-else class="nb-avatar__fallback">
      <slot />
    </span>
  </span>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.nb-avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: $radius-full;
  background-color: var(--nb-surface-subtle);

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--nb-text-tertiary);
    background-color: var(--nb-surface-subtle);
  }
}
</style>
