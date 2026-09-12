import { describe, expect, it } from 'vitest'
import { normalizeContent } from '@/utils/content/validateContent'

describe('normalizeContent', () => {
  it('非数组输入返回空数组', () => {
    expect(normalizeContent(null)).toEqual([])
    expect(normalizeContent('text')).toEqual([])
    expect(normalizeContent({ type: 'paragraph' })).toEqual([])
  })

  it('未知 block type 丢弃', () => {
    expect(normalizeContent([{ type: 'unknownBlock' }])).toEqual([])
  })

  it('非白名单内联节点丢弃，仅保留 text / hardBreak', () => {
    expect(
      normalizeContent([
        {
          type: 'paragraph',
          children: [{ type: 'image', attrs: { src: '/a.png' } }, { type: 'text', text: '保留' }],
        },
      ]),
    ).toEqual([{ type: 'paragraph', children: [{ type: 'text', text: '保留' }] }])
  })

  it('marks 白名单：bold/italic/code 保留，未知丢弃', () => {
    expect(
      normalizeContent([
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'x',
              marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'code' }, { type: 'unknownMark' }],
            },
          ],
        },
      ]),
    ).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'x', marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'code' }] },
        ],
      },
    ])
  })

  it('link 标记：合法 href 保留，危险协议丢弃后保留文本', () => {
    const ok = normalizeContent([
      { type: 'paragraph', children: [{ type: 'text', text: 'a', marks: [{ type: 'link', href: 'https://x.com' }] }] },
    ])
    expect(ok[0]).toEqual({
      type: 'paragraph',
      children: [{ type: 'text', text: 'a', marks: [{ type: 'link', href: 'https://x.com' }] }],
    })

    // TipTap JSON 的 href 包在 attrs 里，同样要能识别
    const tiptapShape = normalizeContent([
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'a', marks: [{ type: 'link', attrs: { href: 'https://x.com' } }] }],
      },
    ])
    expect(tiptapShape[0]).toEqual({
      type: 'paragraph',
      children: [{ type: 'text', text: 'a', marks: [{ type: 'link', href: 'https://x.com' }] }],
    })

    const bad = normalizeContent([
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'a', marks: [{ type: 'link', href: 'javascript:alert(1)' }] }],
      },
    ])
    expect(bad[0]).toEqual({ type: 'paragraph', children: [{ type: 'text', text: 'a' }] })
  })

  it('heading 级别钳制到 1-3，非法输入回落为 2', () => {
    const level = (raw: unknown) =>
      (normalizeContent([{ type: 'heading', level: raw, children: [] }])[0] as { level?: number })?.level

    expect(level(9)).toBe(3)
    expect(level(0)).toBe(1)
    expect(level('x')).toBe(2)
    expect(level(2.6)).toBe(3)
  })

  it('列表过滤空条目', () => {
    expect(
      normalizeContent([
        {
          type: 'bulletList',
          items: [{ children: [] }, { children: [{ type: 'text', text: '有内容' }] }],
        },
      ]),
    ).toEqual([{ type: 'bulletList', items: [{ children: [{ type: 'text', text: '有内容' }] }] }])
  })

  it('image/video 携带危险 URL 时整块丢弃', () => {
    expect(normalizeContent([{ type: 'image', src: 'javascript:alert(1)' }])).toEqual([])
    expect(normalizeContent([{ type: 'video', src: 'data:text/html,x' }])).toEqual([])
  })

  it('video poster 危险 URL 时仅丢弃 poster，保留块', () => {
    expect(
      normalizeContent([{ type: 'video', src: '/v.mp4', poster: 'javascript:alert(1)' }]),
    ).toEqual([{ type: 'video', src: '/v.mp4', poster: undefined }])
  })

  it('image/video 合法字段保留', () => {
    expect(
      normalizeContent([
        { type: 'image', src: '/a.png', alt: 'alt', caption: '图注' },
        { type: 'video', src: '/v.mp4', poster: '/p.jpg' },
      ]),
    ).toEqual([
      { type: 'image', src: '/a.png', alt: 'alt', caption: '图注' },
      { type: 'video', src: '/v.mp4', poster: '/p.jpg' },
    ])
  })

  it('divider 与 codeBlock 正常保留', () => {
    expect(
      normalizeContent([
        { type: 'divider' },
        { type: 'codeBlock', code: 'const a = 1', lang: 'ts' },
      ]),
    ).toEqual([
      { type: 'divider' },
      { type: 'codeBlock', code: 'const a = 1', lang: 'ts' },
    ])
  })
})
