<script setup lang="ts">
import type { Block } from '@/types/content'

const props = defineProps<{ block: Extract<Block, { type: 'image' }> }>()
</script>

<template>
  <figure>
    <img :src="block.src" :alt="block.alt ?? ''" loading="lazy" decoding="async" />
    <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
  </figure>
</template>
