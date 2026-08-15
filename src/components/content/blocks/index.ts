import type { Component } from 'vue'
import type { BlockType } from '@/types/content'
import BlockParagraph from './BlockParagraph.vue'
import BlockHeading from './BlockHeading.vue'
import BlockList from './BlockList.vue'
import BlockBlockquote from './BlockBlockquote.vue'
import BlockCode from './BlockCode.vue'
import BlockImage from './BlockImage.vue'
import BlockVideo from './BlockVideo.vue'
import BlockDivider from './BlockDivider.vue'

/**
 * block type → 组件 注册表。
 * 新增一种内容块 = 在 schema 加类型 + 新增一个组件 + 在这里注册，核心零改动。
 *
 * 注：BlockBlockquote 需要递归渲染子块，会反向引用本文件，构成良性循环依赖
 * （blockMap 在运行时才被访问，模块初始化阶段无问题）。
 */
export const blockMap: Record<BlockType, Component> = {
  paragraph: BlockParagraph,
  heading: BlockHeading,
  bulletList: BlockList,
  orderedList: BlockList,
  blockquote: BlockBlockquote,
  codeBlock: BlockCode,
  image: BlockImage,
  video: BlockVideo,
  divider: BlockDivider,
}
