import type { ArticleContent, Block, Inline, InlineMark } from '@/types/content'
import { sanitizeUrl } from './sanitizeUrl'

/**
 * 运行时结构校验：将任意输入（可能是畸形 AI 输出或未来 schema 漂移）
 * 归一化为合法的 ArticleContent。
 * - 未知 block type 丢弃
 * - 非法 URL 的 image/video 丢弃、link 标记丢弃（保留文本）
 * - 字段缺失时兜底
 */
function normalizeMark(raw: unknown): InlineMark | null {
  if (!raw || typeof raw !== 'object') return null
  const mark = raw as { type?: unknown; href?: unknown }

  switch (mark.type) {
    case 'bold':
    case 'italic':
    case 'code':
      return { type: mark.type }
    case 'link': {
      const href = sanitizeUrl(typeof mark.href === 'string' ? mark.href : undefined)
      return href ? { type: 'link', href } : null
    }
    default:
      return null
  }
}

function normalizeInlines(raw: unknown): Inline[] {
  if (!Array.isArray(raw)) return []
  const out: Inline[] = []

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const node = item as { type?: unknown; text?: unknown; marks?: unknown }

    if (node.type === 'hardBreak') {
      out.push({ type: 'hardBreak' })
      continue
    }

    if (node.type === 'text' && typeof node.text === 'string') {
      const marks = Array.isArray(node.marks)
        ? node.marks.map(normalizeMark).filter((m): m is InlineMark => m !== null)
        : []
      out.push({ type: 'text', text: node.text, marks: marks.length ? marks : undefined })
    }
  }

  return out
}

function normalizeBlock(raw: unknown): Block | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>

  switch (b.type) {
    case 'paragraph':
      return { type: 'paragraph', children: normalizeInlines(b.children) }

    case 'heading': {
      const rawLevel = typeof b.level === 'number' ? b.level : 2
      const level = Math.min(3, Math.max(1, Math.round(rawLevel))) as 1 | 2 | 3
      return { type: 'heading', level, children: normalizeInlines(b.children) }
    }

    case 'bulletList':
    case 'orderedList': {
      const items = (Array.isArray(b.items) ? b.items : [])
        .map((item) => ({ children: normalizeInlines((item as { children?: unknown })?.children) }))
        .filter((item) => item.children.length > 0)
      return { type: b.type, items }
    }

    case 'blockquote': {
      const children = Array.isArray(b.children)
        ? b.children.map(normalizeBlock).filter((c): c is Block => c !== null)
        : []
      return { type: 'blockquote', children }
    }

    case 'codeBlock':
      return {
        type: 'codeBlock',
        code: typeof b.code === 'string' ? b.code : '',
        lang: typeof b.lang === 'string' && b.lang ? b.lang : undefined,
      }

    case 'image': {
      const src = sanitizeUrl(typeof b.src === 'string' ? b.src : undefined)
      if (!src) return null
      return {
        type: 'image',
        src,
        alt: typeof b.alt === 'string' ? b.alt : undefined,
        caption: typeof b.caption === 'string' ? b.caption : undefined,
      }
    }

    case 'video': {
      const src = sanitizeUrl(typeof b.src === 'string' ? b.src : undefined)
      if (!src) return null
      return {
        type: 'video',
        src,
        poster: typeof b.poster === 'string' ? sanitizeUrl(b.poster) : undefined,
      }
    }

    case 'divider':
      return { type: 'divider' }

    default:
      return null
  }
}

export function normalizeContent(input: unknown): ArticleContent {
  if (!Array.isArray(input)) return []
  return input.map(normalizeBlock).filter((b): b is Block => b !== null)
}
