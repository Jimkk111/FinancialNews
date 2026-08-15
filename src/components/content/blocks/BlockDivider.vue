<script setup lang="ts">
import type { Block } from '@/types/content'

const props = defineProps<{ block: Extract<Block, { type: 'divider' }> }>()
</script>

<template>
  <hr />
</template>
