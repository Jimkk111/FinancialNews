import DOMPurify from 'dompurify'
import { marked } from 'marked'

// AI 输出的内容不可信（可能被间接注入 HTML/脚本，如总结的外部新闻正文），
// 因此 marked 渲染后的 HTML 必须经 DOMPurify 消毒才能进入 v-html。
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

/** 渲染 AI 输出的 Markdown：marked 转换 + DOMPurify 消毒 */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false, breaks: true }) as string
  return DOMPurify.sanitize(html)
}
