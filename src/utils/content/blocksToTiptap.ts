import type { JSONContent } from '@tiptap/core'
import type { ArticleContent, Block, Inline } from '@/types/content'

/**
 * 块级 JSON → TipTap(ProseMirror) JSON。
 * 编辑器加载草稿时由 v-model 值转换为 setContent 的入参。
 */
function inlineToPM(inlines: Inline[]): JSONContent[] {
  const out: JSONContent[] = []
  for (const node of inlines) {
    if (node.type === 'hardBreak') {
      out.push({ type: 'hardBreak' })
      continue
    }

    const marks = (node.marks ?? []).map((m) =>
      m.type === 'link' ? { type: 'link', attrs: { href: m.href } } : { type: m.type },
    )
    out.push({ type: 'text', text: node.text, marks: marks.length ? marks : undefined })
  }
  return out
}

function blockToPM(block: Block): JSONContent {
  switch (block.type) {
    case 'paragraph':
      return { type: 'paragraph', content: inlineToPM(block.children) }
    case 'heading':
      return { type: 'heading', attrs: { level: block.level }, content: inlineToPM(block.children) }
    case 'bulletList':
    case 'orderedList':
      return {
        type: block.type,
        content: block.items.map((item) => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: inlineToPM(item.children) }],
        })),
      }
    case 'blockquote':
      return { type: 'blockquote', content: block.children.map(blockToPM) }
    case 'codeBlock':
      return {
        type: 'codeBlock',
        attrs: { language: block.lang ?? null },
        content: block.code ? [{ type: 'text', text: block.code }] : [],
      }
    case 'image':
      return { type: 'image', attrs: { src: block.src, alt: block.alt ?? null } }
    case 'video':
      return { type: 'video', attrs: { src: block.src, poster: block.poster ?? null } }
    case 'divider':
      return { type: 'horizontalRule' }
  }
}

export function blocksToTiptap(content: ArticleContent): JSONContent {
  return { type: 'doc', content: content.map(blockToPM) }
}
