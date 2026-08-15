import type { ArticleContent, Block, Inline } from '@/types/content'

/**
 * 块级 JSON → 干净 HTML 字符串（无内联样式 class）。
 * 用于向后端保存草稿/发布时适配「content 仍为 HTML 字符串」的旧契约，
 * 待后端切换到 JSON 存储后可移除。
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;')
}

function inlineToHtml(inlines: Inline[]): string {
  let out = ''
  for (const node of inlines) {
    if (node.type === 'hardBreak') {
      out += '<br>'
      continue
    }

    const marks = node.marks ?? []
    const has = (t: string) => marks.some((m) => m.type === t)

    let text = escapeHtml(node.text)
    if (has('code')) text = `<code>${text}</code>`

    const link = marks.find((m) => m.type === 'link')
    if (link) text = `<a href="${escapeAttr(link.href)}">${text}</a>`

    if (has('italic')) text = `<em>${text}</em>`
    if (has('bold')) text = `<strong>${text}</strong>`

    out += text
  }
  return out
}

function blockToHtml(block: Block): string {
  switch (block.type) {
    case 'paragraph':
      return `<p>${inlineToHtml(block.children)}</p>`
    case 'heading':
      return `<h${block.level}>${inlineToHtml(block.children)}</h${block.level}>`
    case 'bulletList':
      return `<ul>${block.items.map((item) => `<li>${inlineToHtml(item.children)}</li>`).join('')}</ul>`
    case 'orderedList':
      return `<ol>${block.items.map((item) => `<li>${inlineToHtml(item.children)}</li>`).join('')}</ol>`
    case 'blockquote':
      return `<blockquote>${block.children.map(blockToHtml).join('')}</blockquote>`
    case 'codeBlock':
      return `<pre><code${block.lang ? ` class="language-${escapeAttr(block.lang)}"` : ''}>${escapeHtml(block.code)}</code></pre>`
    case 'image':
      return `<img src="${escapeAttr(block.src)}"${block.alt ? ` alt="${escapeAttr(block.alt)}"` : ''}>`
    case 'video':
      return `<video controls src="${escapeAttr(block.src)}"></video>`
    case 'divider':
      return '<hr>'
  }
}

export function blocksToHtml(content: ArticleContent): string {
  return content.map(blockToHtml).join('')
}
