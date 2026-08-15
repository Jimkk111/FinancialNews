<script setup lang="ts">
import { computed } from 'vue'
import type { Block } from '@/types/content'
import InlineText from '../InlineText.vue'

const props = defineProps<{ block: Extract<Block, { type: 'heading' }> }>()

const tag = computed(() => `h${props.block.level}` as 'h1' | 'h2' | 'h3')
</script>

<template>
  <component :is="tag"><InlineText :children="block.children" /></component>
</template>
