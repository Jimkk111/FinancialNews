<script setup lang="ts">
import type { Block } from '@/types/content'
import InlineText from '../InlineText.vue'

const props = defineProps<{ block: Extract<Block, { type: 'paragraph' }> }>()
</script>

<template>
  <p><InlineText :children="block.children" /></p>
</template>
