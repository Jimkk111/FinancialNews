import type { JSONContent } from '@tiptap/core'
import type { ArticleContent, Block, Inline, InlineMark } from '@/types/content'

/**
 * TipTap(ProseMirror) JSON → 块级 JSON。
 * 编辑器 onUpdate 时由 getJSON() 结果转换，用于 v-model 输出。
 * 不支持/未知的节点与标记在此丢弃（当前工具栏不会产生）。
 */
function marksToInlineMarks(marks?: JSONContent['marks']): InlineMark[] | undefined {
  if (!marks || marks.length === 0) return undefined

  const out: InlineMark[] = []
  for (const m of marks) {
    if (m.type === 'bold') out.push({ type: 'bold' })
    else if (m.type === 'italic') out.push({ type: 'italic' })
    else if (m.type === 'code') out.push({ type: 'code' })
    else if (m.type === 'link') out.push({ type: 'link', href: String(m.attrs?.href ?? '') })
  }
  return out.length ? out : undefined
}

function inlineChildren(node: JSONContent): Inline[] {
  const out: Inline[] = []
  for (const child of node.content ?? []) {
    if (child.type === 'text') {
      out.push({ type: 'text', text: child.text ?? '', marks: marksToInlineMarks(child.marks) })
    } else if (child.type === 'hardBreak') {
      out.push({ type: 'hardBreak' })
    }
  }
  return out
}

function clampLevel(level: unknown): 1 | 2 | 3 {
  const n = typeof level === 'number' ? level : 2
  if (n <= 1) return 1
  if (n >= 3) return 3
  return n as 1 | 2 | 3
}

function listItems(node: JSONContent): { children: Inline[] }[] {
  const items: { children: Inline[] }[] = []
  for (const li of node.content ?? []) {
    if (li.type !== 'listItem') continue
    // v1：扁平化，取第一个段落的文本；嵌套列表不展开
    const para = li.content?.find((c) => c.type === 'paragraph')
    items.push({ children: para ? inlineChildren(para) : [] })
  }
  return items
}

function convertBlock(node: JSONContent): Block | null {
  switch (node.type) {
    case 'paragraph':
      return { type: 'paragraph', children: inlineChildren(node) }
    case 'heading':
      return { type: 'heading', level: clampLevel(node.attrs?.level), children: inlineChildren(node) }
    case 'bulletList':
      return { type: 'bulletList', items: listItems(node) }
    case 'orderedList':
      return { type: 'orderedList', items: listItems(node) }
    case 'blockquote':
      return { type: 'blockquote', children: convertBlocks(node) }
    case 'codeBlock':
      return {
        type: 'codeBlock',
        code: (node.content ?? []).map((c) => c.text ?? '').join(''),
        lang: typeof node.attrs?.language === 'string' ? node.attrs.language : undefined,
      }
    case 'horizontalRule':
      return { type: 'divider' }
    case 'image':
      return {
        type: 'image',
        src: String(node.attrs?.src ?? ''),
        alt: typeof node.attrs?.alt === 'string' ? node.attrs.alt : undefined,
      }
    case 'video':
      return {
        type: 'video',
        src: String(node.attrs?.src ?? ''),
        poster: typeof node.attrs?.poster === 'string' ? node.attrs.poster : undefined,
      }
    default:
      return null
  }
}

function convertBlocks(node: JSONContent): Block[] {
  return (node.content ?? []).map(convertBlock).filter((b): b is Block => b !== null)
}

export function tiptapToBlocks(doc: JSONContent | null | undefined): ArticleContent {
  if (!doc || doc.type !== 'doc') return []
  return convertBlocks(doc)
}
