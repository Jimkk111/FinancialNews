import type { ArticleContent, Block, Inline, InlineMark } from '@/types/content'
import { normalizeContent } from './validateContent'

/**
 * HTML 字符串 → 块级 JSON。
 * 用途：
 * 1. 展示端把后端存量的 HTML 正文转成块渲染（兼容旧数据）；
 * 2. 编辑器加载草稿时把后端 HTML 还原为块。
 *
 * 转换本身即「白名单清洗」：只识别白名单元素与属性，script/style/iframe/on* 等
 * 一律被忽略，天然不携带危险节点。
 */

// 完全跳过、不提取任何内容的危险/无意义元素
const SKIP_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
  'textarea', 'select', 'button', 'noscript', 'template', 'svg', 'math', 'link', 'meta',
])

function parseInline(container: Node, marks: InlineMark[] = []): Inline[] {
  const out: Inline[] = []

  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''
      if (text) out.push({ type: 'text', text, marks: marks.length ? [...marks] : undefined })
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as Element
    const tag = el.tagName.toLowerCase()

    if (tag === 'br') {
      out.push({ type: 'hardBreak' })
    } else if (tag === 'strong' || tag === 'b') {
      out.push(...parseInline(el, [...marks, { type: 'bold' }]))
    } else if (tag === 'em' || tag === 'i') {
      out.push(...parseInline(el, [...marks, { type: 'italic' }]))
    } else if (tag === 'code') {
      out.push(...parseInline(el, [...marks, { type: 'code' }]))
    } else if (tag === 'a') {
      const href = el.getAttribute('href') ?? ''
      const linkMark: InlineMark = { type: 'link', href }
      const nextMarks = href ? [...marks, linkMark] : marks
      out.push(...parseInline(el, nextMarks))
    } else if (SKIP_TAGS.has(tag)) {
      // 跳过
    } else {
      // span / 其他未知内联容器：仅向下递归，不新增标记
      out.push(...parseInline(el, marks))
    }
  })

  return out
}

function parseListItems(list: Element): { children: Inline[] }[] {
  const items: { children: Inline[] }[] = []
  list.querySelectorAll(':scope > li').forEach((li) => {
    // v1：扁平化，li 内文本统一提取（嵌套列表文本并入，不展开层级）
    items.push({ children: parseInline(li) })
  })
  return items
}

function parseCodeBlock(pre: Element): Block {
  let code = pre.textContent ?? ''
  if (code.endsWith('\n')) code = code.slice(0, -1)

  const codeEl = pre.querySelector('code')
  const cls = codeEl?.getAttribute('class') ?? ''
  const langMatch = cls.match(/language-([\w-]+)/)

  return { type: 'codeBlock', code, lang: langMatch ? langMatch[1] : undefined }
}

function parseSingleBlock(el: Element): Block | Block[] | null {
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case 'p':
      return { type: 'paragraph', children: parseInline(el) }
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const level = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3
      return { type: 'heading', level, children: parseInline(el) }
    }
    case 'ul':
      return { type: 'bulletList', items: parseListItems(el) }
    case 'ol':
      return { type: 'orderedList', items: parseListItems(el) }
    case 'blockquote':
      return { type: 'blockquote', children: parseBlockElement(el) }
    case 'pre':
      return parseCodeBlock(el)
    case 'hr':
      return { type: 'divider' }
    case 'img': {
      const src = el.getAttribute('src') ?? ''
      const alt = el.getAttribute('alt') ?? undefined
      return { type: 'image', src, alt }
    }
    case 'video': {
      const src = el.getAttribute('src') ?? ''
      const poster = el.getAttribute('poster') ?? undefined
      return { type: 'video', src, poster }
    }
    case 'br':
      return { type: 'paragraph', children: [{ type: 'hardBreak' }] }
    case 'div':
    case 'figure':
    case 'article':
    case 'section':
    case 'main':
      return parseBlockElement(el)
    default:
      if (SKIP_TAGS.has(tag)) return null
      // 未知容器（如 table/tr/td）：递归提取文本，保留内容、丢弃结构
      return parseBlockElement(el)
  }
}

function parseBlockElement(container: Element): Block[] {
  const blocks: Block[] = []

  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').trim()
      if (text) blocks.push({ type: 'paragraph', children: [{ type: 'text', text }] })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const result = parseSingleBlock(node as Element)
    if (Array.isArray(result)) blocks.push(...result)
    else if (result) blocks.push(result)
  })

  return blocks
}

function plainTextToBlocks(text: string): ArticleContent {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter((para) => para.length > 0)
    .map((para) => {
      const children: Inline[] = []
      para.split('\n').forEach((line, i) => {
        if (i > 0) children.push({ type: 'hardBreak' })
        children.push({ type: 'text', text: line })
      })
      return { type: 'paragraph', children }
    })
}

export function htmlToBlocks(html: string): ArticleContent {
  if (!html) return []

  // 无标签的纯文本：按空行分段
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return normalizeContent(plainTextToBlocks(html))
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const blocks = parseBlockElement(doc.body)
  return normalizeContent(blocks)
}
