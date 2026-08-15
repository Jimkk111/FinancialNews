<script setup lang="ts">
import type { Block } from '@/types/content'
import InlineText from '../InlineText.vue'

const props = defineProps<{ block: Extract<Block, { type: 'bulletList' | 'orderedList' }> }>()
</script>

<template>
  <ul v-if="block.type === 'bulletList'">
    <li v-for="(item, i) in block.items" :key="i">
      <InlineText :children="item.children" />
    </li>
  </ul>
  <ol v-else>
    <li v-for="(item, i) in block.items" :key="i">
      <InlineText :children="item.children" />
    </li>
  </ol>
</template>
