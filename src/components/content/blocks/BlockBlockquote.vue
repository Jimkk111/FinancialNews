<script setup lang="ts">
import type { Block } from '@/types/content'
import { blockMap } from './index'

const props = defineProps<{ block: Extract<Block, { type: 'blockquote' }> }>()
</script>

<template>
  <blockquote>
    <component
      :is="blockMap[child.type]"
      v-for="(child, i) in block.children"
      :key="i"
      :block="child"
    />
  </blockquote>
</template>
