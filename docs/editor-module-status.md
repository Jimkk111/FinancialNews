# 编辑器模块新现状

> 记录日期：2026-08-15
> 范围：新闻正文的内容模型、编辑器、展示渲染，以及相关的草稿/发布/标签链路。

## 一、本次改造解决了什么

1. **XSS 风险**：展示端彻底移除 `v-html`，正文改为「块级 JSON」渲染，文本走 Vue 插值自动转义；仅 `src`/`href` 两个 URL 字段做协议白名单校验。
2. **样式/排版难控**：样式从「固化进存储的 HTML class」中剥离，收敛到「组件 + 单一主题样式层」；编辑端与展示端共用同一套 `.news-prose` 作用域，实现所见即所得。
3. **编辑模块既有 bug**：标签失效、发布旧内容、自动保存无脏检查、错误信息被吞等（见文末清单）。

## 二、内容模型（唯一契约）

正文统一为**块级 JSON**，类型定义在 `src/types/content.ts`：

```ts
type InlineMark =
  | { type: 'bold' } | { type: 'italic' } | { type: 'code' }
  | { type: 'link'; href: string }

type Inline =
  | { type: 'text'; text: string; marks?: InlineMark[] }
  | { type: 'hardBreak' }

type Block =
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'heading'; level: 1 | 2 | 3; children: Inline[] }
  | { type: 'bulletList'; items: { children: Inline[] }[] }
  | { type: 'orderedList'; items: { children: Inline[] }[] }
  | { type: 'blockquote'; children: Block[] }
  | { type: 'codeBlock'; code: string; lang?: string }
  | { type: 'image'; src: string; alt?: string; caption?: string }
  | { type: 'video'; src: string; poster?: string }
  | { type: 'divider' }

type ArticleContent = Block[]
```

**约束（重要）**：schema 中不允许出现 `style` / `class` 等样式字段。样式只允许存在于「渲染组件」与「prose 主题样式」两层。

## 三、文件结构

```
src/types/content.ts                        # 内容模型类型
src/utils/content/
  sanitizeUrl.ts                            # URL 协议白名单
  validateContent.ts                        # 运行时结构校验 normalizeContent
  tiptapToBlocks.ts                         # TipTap JSON → 块 JSON（编辑器输出）
  blocksToTiptap.ts                         # 块 JSON → TipTap JSON（编辑器回填）
src/components/content/
  ArticleContent.vue                        # 渲染入口，按 block.type 分发
  InlineText.vue                            # 内联渲染（render function）
  blocks/
    index.ts                                # blockMap 注册表
    BlockParagraph.vue / BlockHeading.vue / BlockList.vue /
    BlockBlockquote.vue / BlockCode.vue / BlockImage.vue /
    BlockVideo.vue / BlockDivider.vue
src/styles/prose.css                        # .news-prose 主题排版（替换 tiptap.css）
```

## 四、数据流（编辑 → 展示）

```
编辑：TipTap 文档树 --getJSON--> tiptapToBlocks --> ArticleContent（v-model）
保存：ArticleContent --contentJson--> 后端
加载：后端 contentJson --blocksToTiptap--> TipTap 文档树
展示：后端 contentJson --> ArticleContent 组件（无 v-html）
```

关键点：编辑器 `v-model` 与后端 `contentJson` 字段均为块级 JSON（`ArticleContent`），前端不再做任何 HTML 转换；仅保留 TipTap 与块 JSON 之间的转换器（`tiptapToBlocks` / `blocksToTiptap`）。

## 五、安全模型

- 渲染无 `v-html`，文本插值自动转义。
- `normalizeContent`（`validateContent.ts`）在渲染入口对任意输入做结构校验：未知 block 丢弃、非法 URL 的 image/video 丢弃、link 标记丢弃但保留文本。
- `sanitizeUrl` 拦截 `javascript:` / `vbscript:` / `data:` / `file:` 协议。

## 六、样式机制

- 单一作用域 `.news-prose`（`prose.css`），颜色全部走主题 token（`var(--foreground)` / `var(--brand)` / `var(--muted-foreground)` 等），暗色随 `.dark` 自动切换。
- 编辑器根节点与展示端渲染容器都套 `.news-prose`，改样式一处生效、两端一致。
- 作用域名刻意避开 Tailwind typography 的 `.prose`，避免与 AI 消息（`MessageBubble.vue`）的样式冲突。
- 编辑器内不再内联任何 class 到节点（图片/链接/视频的 `HTMLAttributes` 已移除）。

## 七、本次已修复的 bug

| # | 问题 | 修复 |
|---|---|---|
| 1 | 发布可能发旧内容（`publish` 不先保存、只传 id 给后端） | 发布前 `await saveDraft(false)`，再校验 `currentDraftId` |
| 2 | 新草稿 30s 内发布 → `POST /drafts//publish` 404 | 同上，先保存生成 id |
| 3 | 标签选择是摆设（从未提交） | `NewsDraft`/草稿 API/service 全链路补 `tags: number[]`，save/publish 提交 |
| 4 | 自动保存无脏检查、可能并发创建重复草稿 | 快照对比 `buildSnapshot() !== lastSavedSnapshot` + `saving` 互斥 |
| 5 | 错误信息被吞 | `catch (err)` 透出 `err.message`，非成功分支透出 `response.error.message` |
| 6 | 视频扩展重复/不一致、`addYoutube` 命名误导 | 合并为单一 `extensions/Video.ts`，重命名 `addVideo` |
| 7 | 编辑/展示两套样式脱节（编辑器无 `.tiptap`） | 统一 `.news-prose`，编辑器根节点套用，实现所见即所得 |
| 8 | 分层不一致（`getCategories`/`getTags`/`deletePublishedNews` 直连 api） | 改走 service 层 |

## 八、已知限制（待后续）

1. **嵌套列表**：v1 扁平化处理，TipTap 里 tab 缩进的嵌套列表不展开层级（文本保留）。
2. **爬取内容**：尚未接入 AI 结构化，依赖后端把爬取内容也规范化为 `contentJson` 后前端直接渲染。
3. **旧数据**：历史新闻若无 `contentJson` 字段，前端展示为空，需后端迁移补齐。
