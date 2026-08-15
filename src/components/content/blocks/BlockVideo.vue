<script setup lang="ts">
import type { Block } from '@/types/content'

const props = defineProps<{ block: Extract<Block, { type: 'video' }> }>()
</script>

<template>
  <video :src="block.src" :poster="block.poster ?? undefined" controls preload="metadata" />
</template>
