<script setup lang="ts">
import type { Block } from '@/types/content'

const props = defineProps<{ block: Extract<Block, { type: 'codeBlock' }> }>()
</script>

<template>
  <pre><code>{{ block.code }}</code></pre>
</template>
