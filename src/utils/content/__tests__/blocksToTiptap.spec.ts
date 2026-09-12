import type { ArticleContent } from '@/types/content'
import { describe, expect, it } from 'vitest'
import { blocksToTiptap } from '@/utils/content/blocksToTiptap'
import { tiptapToBlocks } from '@/utils/content/tiptapToBlocks'

describe('blocksToTiptap', () => {
  it('输出 doc 根节点', () => {
    expect(blocksToTiptap([])).toEqual({ type: 'doc', content: [] })
  })

  it('image 写入 caption 属性，编辑器往返不丢图注', () => {
    expect(blocksToTiptap([{ type: 'image', src: '/a.png', alt: 'alt', caption: '图注' }])).toEqual({
      type: 'doc',
      content: [{ type: 'image', attrs: { src: '/a.png', alt: 'alt', caption: '图注' } }],
    })
  })

  it('divider 映射为 horizontalRule', () => {
    expect(blocksToTiptap([{ type: 'divider' }])).toEqual({
      type: 'doc',
      content: [{ type: 'horizontalRule' }],
    })
  })

  it('全类型块 经 编辑器 JSON 往返后保持一致', () => {
    const blocks: ArticleContent = [
      { type: 'heading', level: 2, children: [{ type: 'text', text: '标题' }] },
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'a' },
          { type: 'hardBreak' },
          { type: 'text', text: 'b', marks: [{ type: 'bold' }, { type: 'link', href: 'https://x.com' }] },
        ],
      },
      { type: 'bulletList', items: [{ children: [{ type: 'text', text: 'i1' }] }] },
      { type: 'orderedList', items: [{ children: [{ type: 'text', text: 'i2' }] }] },
      { type: 'blockquote', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'q' }] }] },
      { type: 'codeBlock', code: 'const a = 1', lang: 'ts' },
      { type: 'image', src: '/a.png', alt: 'alt', caption: '图注' },
      { type: 'video', src: '/v.mp4', poster: '/p.jpg' },
      { type: 'divider' },
    ]

    expect(tiptapToBlocks(blocksToTiptap(blocks))).toEqual(blocks)
  })
})
