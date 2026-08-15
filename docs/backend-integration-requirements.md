# 后端改造必要信息

> 目的：前端已落地「块级 JSON」内容模型，本文件列出后端需要配合的改动，以及每项改动所需的必要信息。改动按优先级排序，P0 为当前前端已经依赖的契约，P1/P2 为后续阶段。

## 术语

- **块级 JSON / ArticleContent**：正文的结构化表示，schema 见 `docs/editor-module-status.md` 第二节（或 `src/types/content.ts`）。数组元素为 `paragraph / heading / bulletList / orderedList / blockquote / codeBlock / image / video / divider` 九种块。
- **旧 HTML**：后端当前 `content` 字段存储的 HTML 字符串。

---

## P0 —— 草稿/发布新增 `tags` 字段（前端已提交，需后端接收）

前端已在保存草稿/发布时提交 `tags: number[]`（标签 id 数组）。后端需：

1. `POST /drafts`（创建草稿）请求体新增可选字段 `tags: number[]`。
2. `PUT /drafts/:id`（更新草稿）请求体新增可选字段 `tags: number[]`。
3. `GET /drafts/:id` 返回体需回传草稿的 `tags`（`number[]`，可为空数组）。
4. `POST /drafts/:id/publish`：发布时把草稿的 `tags` 关联到生成的新闻。

> 必要信息：后端草稿表当前是否有标签关联表？若新闻-标签是多对多，需要确认 `tags` 的写入/读取方式与现有新闻接口（`GET /news/:id` 返回 `tags: Tag[]`）保持一致。

## P0 —— 确认发布接口语义（前端已改为「先保存后发布」）

前端发布流程改为：`saveDraft` → `POST /drafts/:id/publish`。请确认：

1. 发布接口是否以**草稿已保存的最新内容**为准（而非请求体再传 content）。
2. 发布成功后草稿是否删除/转正？前端发布成功即跳转详情页，未再处理草稿。

> 必要信息：`POST /drafts/:id/publish` 的完整语义（草稿转正 vs 复制、草稿状态流转）。

---

## P1 —— `content` 存储格式从 HTML 迁移到 JSON（核心改造）

当前前端已用块 JSON 作为唯一内容契约，但保存时通过 `blocksToHtml` 序列化回 HTML 以兼容旧契约。建议后端把 `content` 迁移为 JSON 存储，前后端统一为 `ArticleContent`。

### 方案

- 新增字段 `content_json`（JSON 类型），或把 `content` 改为 JSON 类型。推荐**新增 `content_json`** 保留 `content` 过渡，便于灰度与回滚。
- 前端切换：移除 `blocksToHtml`/`htmlToBlocks` 适配器，草稿/新闻接口直接收发 `ArticleContent`。

### 存量数据迁移

1. 存量 `content`（HTML）→ `content_json`（块 JSON）。转换规则与前端 `htmlToBlocks` 一致（白名单提取 + 纯文本分段）。
2. 迁移后 `content` 字段可废弃或仅作只读回退。

> 必要信息：后端数据库类型（MySQL/Postgres?）、`content` 字段当前类型、新闻与草稿表结构、数据量级（决定迁移方式：脚本 vs 双写灰度）。

---

## P2 —— 爬取内容 AI 结构化管线

爬取内容不直接以脏 HTML 入库，而是经 LLM 抽取并结构化后，以 `ArticleContent` 直接入库（前端渲染器无需改动，直接消费 JSON）。

### 建议管线

```
抓取原始页 → 正文抽取 → LLM 按 ArticleContent 的 JSON Schema 结构化输出
          → 后端校验（结构 + URL 协议白名单）→ 存 content_json
```

### 必要信息

1. 现有爬虫链路在哪个服务/模块？入库前的清洗点在哪。
2. LLM 的接入方式（现有 AI 助手已用某模型，可复用同一调用入口）。
3. 校验规则建议：后端复刻前端 `validateContent` 的白名单逻辑（未知块丢弃、URL 只允许 http/https），作为结构化输出的兜底。

---

## 附：前端已就绪、后端无需改动的部分

- 展示端 XSS 修复（无 `v-html`）：纯前端，已生效。
- 编辑/展示共用 `.news-prose` 排版：纯前端，已生效。
- 编辑器 `v-model` 已切块 JSON：纯前端内部改造。
