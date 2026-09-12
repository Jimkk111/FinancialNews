import { describe, expect, it } from 'vitest'
import { blocksToHtml } from '@/utils/content/blocksToHtml'

describe('blocksToHtml', () => {
  it('paragraph 与 heading', () => {
    expect(blocksToHtml([{ type: 'paragraph', children: [{ type: 'text', text: 'a' }] }])).toBe('<p>a</p>')
    expect(
      blocksToHtml([{ type: 'heading', level: 2, children: [{ type: 'text', text: '标题' }] }]),
    ).toBe('<h2>标题</h2>')
  })

  it('marks 渲染顺序：code → link → em → strong', () => {
    expect(
      blocksToHtml([
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'x', marks: [{ type: 'bold' }, { type: 'code' }] }],
        },
      ]),
    ).toBe('<p><strong><code>x</code></strong></p>')

    expect(
      blocksToHtml([
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'y', marks: [{ type: 'link', href: 'https://x.com' }, { type: 'italic' }] }],
        },
      ]),
    ).toBe('<p><em><a href="https://x.com">y</a></em></p>')
  })

  it('hardBreak 与 divider', () => {
    expect(
      blocksToHtml([
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }, { type: 'text', text: 'b' }],
        },
      ]),
    ).toBe('<p>a<br>b</p>')
    expect(blocksToHtml([{ type: 'divider' }])).toBe('<hr>')
  })

  it('列表与 blockquote', () => {
    expect(
      blocksToHtml([{ type: 'bulletList', items: [{ children: [{ type: 'text', text: 'i' }] }] }]),
    ).toBe('<ul><li>i</li></ul>')
    expect(
      blocksToHtml([{ type: 'orderedList', items: [{ children: [{ type: 'text', text: 'i' }] }] }]),
    ).toBe('<ol><li>i</li></ol>')
    expect(
      blocksToHtml([
        { type: 'blockquote', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'q' }] }] },
      ]),
    ).toBe('<blockquote><p>q</p></blockquote>')
  })

  it('codeBlock 保留语言并转义', () => {
    expect(
      blocksToHtml([{ type: 'codeBlock', code: 'const a = "<b>"', lang: 'ts' }]),
    ).toBe('<pre><code class="language-ts">const a = &quot;&lt;b&gt;&quot;</code></pre>')
  })

  it('image 无 caption 时输出裸 img', () => {
    expect(blocksToHtml([{ type: 'image', src: '/a.png', alt: 'alt' }])).toBe('<img src="/a.png" alt="alt">')
  })

  it('image caption 用 figure/figcaption 承载（此前丢失）', () => {
    expect(blocksToHtml([{ type: 'image', src: '/a.png', caption: '图注' }])).toBe(
      '<figure><img src="/a.png"><figcaption>图注</figcaption></figure>',
    )
  })

  it('video 保留 poster（此前丢失）', () => {
    expect(blocksToHtml([{ type: 'video', src: '/v.mp4', poster: '/p.jpg' }])).toBe(
      '<video controls src="/v.mp4" poster="/p.jpg"></video>',
    )
  })

  it('属性中的引号被转义，防止属性逃逸', () => {
    expect(blocksToHtml([{ type: 'image', src: '/a.png" onerror="alert(1)' }])).toBe(
      '<img src="/a.png&quot; onerror=&quot;alert(1)">',
    )
  })
})
