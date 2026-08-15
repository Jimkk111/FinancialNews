/**
 * 正文内容模型（块级 JSON）
 *
 * 这是自建编辑、AI 结构化爬取内容、展示端渲染三方共用的唯一契约。
 * 约束：schema 中永远不出现 style / class 等样式字段，样式只允许存在于
 * 渲染组件与 prose 主题样式两层，否则会重新陷入「样式固化进数据」。
 */

export type InlineMark =
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'code' }
  | { type: 'link'; href: string }

export type Inline =
  | { type: 'text'; text: string; marks?: InlineMark[] }
  | { type: 'hardBreak' }

export interface ListItem {
  children: Inline[]
}

export type Block =
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'heading'; level: 1 | 2 | 3; children: Inline[] }
  | { type: 'bulletList'; items: ListItem[] }
  | { type: 'orderedList'; items: ListItem[] }
  | { type: 'blockquote'; children: Block[] }
  | { type: 'codeBlock'; code: string; lang?: string }
  | { type: 'image'; src: string; alt?: string; caption?: string }
  | { type: 'video'; src: string; poster?: string }
  | { type: 'divider' }

export type ArticleContent = Block[]

export type BlockType = Block['type']
