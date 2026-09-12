import type { JSONContent } from '@tiptap/core'
import type { ArticleContent, Block, Inline, InlineMark, ListItem } from '@/types/content'
import { normalizeContent, normalizeHeadingLevel } from './validateContent'

/**
 * TipTap(ProseMirror) JSON → 块级 JSON。
 * 编辑器 onUpdate 时由 getJSON() 结果转换，用于 v-model 输出。
 *
 * 这里只做「形状映射」：节点类型 / attrs 重命名、codeBlock 文本拼接、列表扁平化。
 * marks 白名单、URL 校验、空列表项过滤等合法性归一化统一收敛到末端的
 * normalizeContent —— 与 htmlToBlocks、AI 结构化输出共用同一套兜底。
 */

function inlineChildren(node: JSONContent): Inline[] {
  // marks 的 type 在 TipTap JSON 中是宽泛的 string，先原样透传，
  // 由 normalizeContent 统一做白名单校验
  const out: Inline[] = []
  for (const child of node.content ?? []) {
    if (child.type === 'text') {
      out.push({ type: 'text', text: child.text ?? '', marks: child.marks as InlineMark[] | undefined })
    } else if (child.type === 'hardBreak') {
      out.push({ type: 'hardBreak' })
    }
  }
  return out
}

function listItems(node: JSONContent): ListItem[] {
  const items: ListItem[] = []
  for (const li of node.content ?? []) {
    if (li.type !== 'listItem') continue
    items.push({ children: flattenListItem(li) })
  }
  return items
}

// v1 扁平化策略（与 htmlToBlocks 的 li 处理保持一致）：按文档序提取 li 内全部
// 文本，嵌套列表内容并入当前项，不展开层级
function flattenListItem(li: JSONContent): Inline[] {
  const out: Inline[] = []
  for (const child of li.content ?? []) {
    if (child.type === 'paragraph') {
      out.push(...inlineChildren(child))
    } else if (child.type === 'bulletList' || child.type === 'orderedList') {
      for (const nested of listItems(child)) out.push(...nested.children)
    }
  }
  return out
}

function convertBlock(node: JSONContent): Block | null {
  switch (node.type) {
    case 'paragraph':
      return { type: 'paragraph', children: inlineChildren(node) }
    case 'heading':
      // 粘贴等途径可能带来 4-6 级标题，这里显式钳制到 schema 上限 3
      return { type: 'heading', level: normalizeHeadingLevel(node.attrs?.level), children: inlineChildren(node) }
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
        caption: typeof node.attrs?.caption === 'string' ? node.attrs.caption : undefined,
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
  return normalizeContent(convertBlocks(doc))
}
