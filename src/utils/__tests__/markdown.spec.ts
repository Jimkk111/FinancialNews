// @vitest-environment jsdom
// DOMPurify 依赖符合规范的 NodeIterator；happy-dom 的迭代器会把根节点一并返回，
// 导致首节点被误删、<script> 反而残留。DOMPurify 的消毒断言须在 jsdom 下验证。
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../markdown'

describe('renderMarkdown', () => {
  it('渲染基础 Markdown 语法', () => {
    expect(renderMarkdown('**加粗**')).toContain('<strong>加粗</strong>')
    expect(renderMarkdown('# 标题')).toContain('<h1>')
  })

  it('移除 script 标签', () => {
    const html = renderMarkdown('hello<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('alert(1)')
  })

  it('移除事件属性（onerror 等）', () => {
    const html = renderMarkdown('<img src="x" onerror="alert(1)">')
    expect(html).not.toContain('onerror')
  })

  it('清除 javascript: 链接', () => {
    const html = renderMarkdown('[点击](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
  })

  it('普通链接添加 target 与 rel 属性', () => {
    const html = renderMarkdown('[官网](https://example.com)')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('iframe 等危险标签被移除', () => {
    const html = renderMarkdown('<iframe src="https://evil.com"></iframe>')
    expect(html).not.toContain('<iframe')
  })

  it('单个换行渲染为 <br>（breaks 模式）', () => {
    const html = renderMarkdown('第一行\n第二行')
    expect(html).toContain('<br>')
  })
})
