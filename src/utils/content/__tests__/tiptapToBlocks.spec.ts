import type { JSONContent } from '@tiptap/core'
import { describe, expect, it } from 'vitest'
import { tiptapToBlocks } from '@/utils/content/tiptapToBlocks'

const doc = (content: JSONContent[]): JSONContent => ({ type: 'doc', content })

describe('tiptapToBlocks', () => {
  it('空输入与非 doc 根节点返回空数组', () => {
    expect(tiptapToBlocks(null)).toEqual([])
    expect(tiptapToBlocks(undefined)).toEqual([])
    expect(tiptapToBlocks({ type: 'fragment', content: [] })).toEqual([])
  })

  it('paragraph 与 marks 透传', () => {
    expect(
      tiptapToBlocks(
        doc([
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'a', marks: [{ type: 'bold' }] },
              { type: 'hardBreak' },
              { type: 'text', text: 'b', marks: [{ type: 'link', attrs: { href: 'https://x.com' } }] },
            ],
          },
        ]),
      ),
    ).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'a', marks: [{ type: 'bold' }] },
          { type: 'hardBreak' },
          { type: 'text', text: 'b', marks: [{ type: 'link', href: 'https://x.com' }] },
        ],
      },
    ])
  })

  it('未知 marks 被末端校验丢弃（如粘贴带入的 textStyle）', () => {
    expect(
      tiptapToBlocks(
        doc([
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'x', marks: [{ type: 'textStyle', attrs: { fontSize: '8pt' } }, { type: 'bold' }] },
            ],
          },
        ]),
      ),
    ).toEqual([{ type: 'paragraph', children: [{ type: 'text', text: 'x', marks: [{ type: 'bold' }] }] }])
  })

  it('link 的危险协议被末端校验拦截，文本保留', () => {
    expect(
      tiptapToBlocks(
        doc([
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }],
          },
        ]),
      ),
    ).toEqual([{ type: 'paragraph', children: [{ type: 'text', text: 'x' }] }])
  })

  it('heading 级别钳制：粘贴的 h4-h6 归到 3', () => {
    expect(
      tiptapToBlocks(doc([{ type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: 'H' }] }])),
    ).toEqual([{ type: 'heading', level: 3, children: [{ type: 'text', text: 'H' }] }])
  })

  it('嵌套列表扁平化：嵌套列表文本并入当前项，不展开层级', () => {
    expect(
      tiptapToBlocks(
        doc([
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: '顶层' }] },
                  {
                    type: 'bulletList',
                    content: [
                      {
                        type: 'listItem',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: '嵌套' }] }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]),
      ),
    ).toEqual([
      { type: 'bulletList', items: [{ children: [{ type: 'text', text: '顶层' }, { type: 'text', text: '嵌套' }] }] },
    ])
  })

  it('空列表条目被末端校验过滤', () => {
    expect(
      tiptapToBlocks(
        doc([
          {
            type: 'orderedList',
            content: [
              { type: 'listItem', content: [{ type: 'paragraph', content: [] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '有内容' }] }] },
            ],
          },
        ]),
      ),
    ).toEqual([{ type: 'orderedList', items: [{ children: [{ type: 'text', text: '有内容' }] }] }])
  })

  it('codeBlock 拼接文本节点并保留语言', () => {
    expect(
      tiptapToBlocks(
        doc([
          {
            type: 'codeBlock',
            attrs: { language: 'ts' },
            content: [{ type: 'text', text: 'const a' }, { type: 'text', text: ' = 1' }],
          },
        ]),
      ),
    ).toEqual([{ type: 'codeBlock', code: 'const a = 1', lang: 'ts' }])
  })

  it('horizontalRule 映射为 divider', () => {
    expect(tiptapToBlocks(doc([{ type: 'horizontalRule' }]))).toEqual([{ type: 'divider' }])
  })

  it('image 含 caption 属性（由编辑器扩展承载）', () => {
    expect(
      tiptapToBlocks(
        doc([{ type: 'image', attrs: { src: '/a.png', alt: 'alt', caption: '图注' } }]),
      ),
    ).toEqual([{ type: 'image', src: '/a.png', alt: 'alt', caption: '图注' }])
  })

  it('image 危险 src 整块丢弃', () => {
    expect(tiptapToBlocks(doc([{ type: 'image', attrs: { src: 'javascript:alert(1)' } }]))).toEqual([])
  })

  it('video 含 poster 属性', () => {
    expect(
      tiptapToBlocks(doc([{ type: 'video', attrs: { src: '/v.mp4', poster: '/p.jpg' } }])),
    ).toEqual([{ type: 'video', src: '/v.mp4', poster: '/p.jpg' }])
  })

  it('blockquote 递归转换内部块', () => {
    expect(
      tiptapToBlocks(
        doc([
          {
            type: 'blockquote',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'q' }] }],
          },
        ]),
      ),
    ).toEqual([{ type: 'blockquote', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'q' }] }] }])
  })
})
