import { Image as TiptapImage } from '@tiptap/extension-image'

/**
 * 官方 Image 扩展不含图注。补充 caption 属性，保证 AI 爬取 / 存量 HTML 中
 * 的图注在编辑器往返（getJSON / setContent）时不被静默丢弃。
 * 编辑态暂不渲染图注，展示端由 BlockImage 的 figcaption 呈现。
 */
export const Image = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: null },
    }
  },
})
