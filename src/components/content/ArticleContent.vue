<script setup lang="ts">
import { computed } from 'vue'
import { blockMap } from './blocks'
import { normalizeContent } from '@/utils/content/validateContent'

/**
 * 正文渲染入口：接收任意输入，归一化后按 block.type 分发到对应组件。
 * 全程不碰 v-html，安全由 normalizeContent + 各节点组件的 URL 兜底共同保证。
 */
const props = defineProps<{ content: unknown }>()

const blocks = computed(() => normalizeContent(props.content))
</script>

<template>
  <div class="news-prose">
    <component
      :is="blockMap[block.type]"
      v-for="(block, index) in blocks"
      :key="index"
      :block="block"
    />
  </div>
</template>
