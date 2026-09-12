import { it } from 'vitest'
import { renderMarkdown } from '../markdown'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

it('debug', () => {
  console.log('marked strong:', JSON.stringify(marked.parse('**加粗**', { async: false, breaks: true })))
  console.log('sanitize strong:', JSON.stringify(DOMPurify.sanitize('<p><strong>加粗</strong></p>')))
  console.log('renderMarkdown strong:', JSON.stringify(renderMarkdown('**加粗**')))
  console.log('renderMarkdown script:', JSON.stringify(renderMarkdown('hello<script>alert(1)</script>')))
  console.log('renderMarkdown link:', JSON.stringify(renderMarkdown('[点击](javascript:alert(1))')))
  console.log('renderMarkdown good link:', JSON.stringify(renderMarkdown('[官网](https://example.com)')))
})
