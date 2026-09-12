import { describe, expect, it } from 'vitest'
import { htmlToBlocks } from '@/utils/content/htmlToBlocks'

describe('htmlToBlocks', () => {
  it('空输入返回空数组', () => {
    expect(htmlToBlocks('')).toEqual([])
  })

  it('无标签纯文本按空行分段，段内换行为 hardBreak', () => {
    expect(htmlToBlocks('第一段\n\n第二段')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: '第一段' }] },
      { type: 'paragraph', children: [{ type: 'text', text: '第二段' }] },
    ])
    expect(htmlToBlocks('a\nb')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }, { type: 'text', text: 'b' }] },
    ])
  })

  it('常见块级元素映射', () => {
    expect(
      htmlToBlocks(
        '<p>a</p><h2>b</h2><ul><li>i1</li><li>i2</li></ul><ol><li>j</li></ol><hr><blockquote><p>q</p></blockquote>',
      ),
    ).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: 'a' }] },
      { type: 'heading', level: 2, children: [{ type: 'text', text: 'b' }] },
      {
        type: 'bulletList',
        items: [{ children: [{ type: 'text', text: 'i1' }] }, { children: [{ type: 'text', text: 'i2' }] }],
      },
      { type: 'orderedList', items: [{ children: [{ type: 'text', text: 'j' }] }] },
      { type: 'divider' },
      { type: 'blockquote', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'q' }] }] },
    ])
  })

  it('h4-h6 钳制到 3 级', () => {
    expect(htmlToBlocks('<h5>x</h5>')).toEqual([
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'x' }] },
    ])
  })

  it('strong/b、em/i、code、a 映射为内联标记', () => {
    expect(
      htmlToBlocks('<p><strong>a</strong><b>b</b><em>c</em><i>d</i><code>e</code><a href="https://x.com">f</a></p>'),
    ).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'a', marks: [{ type: 'bold' }] },
          { type: 'text', text: 'b', marks: [{ type: 'bold' }] },
          { type: 'text', text: 'c', marks: [{ type: 'italic' }] },
          { type: 'text', text: 'd', marks: [{ type: 'italic' }] },
          { type: 'text', text: 'e', marks: [{ type: 'code' }] },
          { type: 'text', text: 'f', marks: [{ type: 'link', href: 'https://x.com' }] },
        ],
      },
    ])
  })

  it('javascript: 链接被末端校验剥离，文本保留', () => {
    expect(htmlToBlocks('<p><a href="javascript:alert(1)">点我</a></p>')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: '点我' }] },
    ])
  })

  it('pre>code 解析为 codeBlock 并提取语言', () => {
    expect(htmlToBlocks('<pre><code class="language-js">const a = 1;\n</code></pre>')).toEqual([
      { type: 'codeBlock', code: 'const a = 1;', lang: 'js' },
    ])
  })

  it('figure>img+figcaption 解析为带 caption 的 image', () => {
    expect(
      htmlToBlocks('<figure><img src="/a.png" alt="alt"><figcaption>图注</figcaption></figure>'),
    ).toEqual([{ type: 'image', src: '/a.png', alt: 'alt', caption: '图注' }])
  })

  it('figure 内无 img 时按普通容器解析', () => {
    expect(htmlToBlocks('<figure><p>text</p></figure>')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: 'text' }] },
    ])
  })

  it('img / video 独立出现时正常解析', () => {
    expect(htmlToBlocks('<img src="/a.png" alt="alt">')).toEqual([
      { type: 'image', src: '/a.png', alt: 'alt', caption: undefined },
    ])
    expect(htmlToBlocks('<video src="/v.mp4" poster="/p.jpg"></video>')).toEqual([
      { type: 'video', src: '/v.mp4', poster: '/p.jpg' },
    ])
  })

  it('script/style 等危险元素被跳过', () => {
    expect(htmlToBlocks('<p>a</p><script>alert(1)</script><style>p{}</style>')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: 'a' }] },
    ])
  })

  it('div 等容器解包，未知元素（table 等）保留文本', () => {
    expect(htmlToBlocks('<div><p>a</p><p>b</p></div>')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: 'a' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'b' }] },
    ])
    expect(htmlToBlocks('<table><tr><td>cell</td></tr></table>')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: 'cell' }] },
    ])
  })

  it('与 blocksToHtml 对 image caption 双向对称', async () => {
    const { blocksToHtml } = await import('@/utils/content/blocksToHtml')
    const html = blocksToHtml([{ type: 'image', src: '/a.png', caption: '图注' }])
    expect(htmlToBlocks(html)).toEqual([{ type: 'image', src: '/a.png', alt: undefined, caption: '图注' }])
  })
})
