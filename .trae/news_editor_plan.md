# 新闻编辑发布功能计划

## 一、功能概述

添加新闻编辑与发布功能，支持用户创建财经新闻内容。

### 核心功能

| 功能 | 说明 |
|------|------|
| 标题编辑 | 单行文本输入，限制字数 |
| 封面图上传 | 支持图片预览、删除、更换 |
| 标签选择 | 从现有标签中多选 |
| 富文本编辑 | 支持格式化文本、图片、视频插入 |
| 预览发布 | 预览效果后发布 |

## 二、技术方案

### 2.1 富文本编辑器选型

**推荐：Tiptap**

| 特性 | 说明 |
|------|------|
| 架构 | 基于 ProseMirror，现代化设计 |
| 扩展性 | 模块化扩展，按需引入 |
| Vue 支持 | 官方 Vue 3 组件 |
| TypeScript | 完整类型支持 |
| 功能 | 标题、列表、链接、图片、视频等 |

**所需依赖：**

```json
{
  "@tiptap/vue-3": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-image": "^2.x",
  "@tiptap/extension-youtube": "^2.x",
  "@tiptap/extension-placeholder": "^2.x"
}
```

### 2.2 数据结构

```typescript
interface NewsDraft {
  id: string
  title: string
  coverImage: string | null
  tags: number[]
  content: string
  category: number
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
}
```

## 三、文件结构

```
src/
├── views/
│   └── NewsEditor.vue          # 新闻编辑页面
├── components/
│   ├── editor/
│   │   ├── EditorToolbar.vue   # 编辑器工具栏
│   │   ├── RichTextEditor.vue  # 富文本编辑器封装
│   │   └── ImageUploader.vue   # 图片上传组件
│   └── TagSelector.vue         # 标签选择器
├── services/
│   └── newsEditorService.ts    # 新闻编辑服务
├── data/
│   └── newsDraft.ts            # 草稿数据管理
└── stores/
    └── newsEditor.ts           # 编辑器状态（可选）
```

## 四、页面布局

```
┌─────────────────────────────────┐
│ ← 发布新闻          [存草稿] [发布] │ ← 固定头部
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ 封面图片                   │  │ ← 点击上传/更换
│  │   [+] 添加封面             │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 请输入新闻标题...          │  │ ← 标题输入
│  └───────────────────────────┘  │
│                                 │
│  分类: [股票 ▼]                 │ ← 分类选择
│                                 │
│  标签: [A股] [港股] [+添加]      │ ← 标签选择
│                                 │
├─────────────────────────────────┤
│  [B] [I] [H1] [H2] [链接] [图] [视频] │ ← 工具栏
├─────────────────────────────────┤
│                                 │
│  正文内容区域...                 │ ← 富文本编辑区
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

## 五、实现步骤

### 步骤 1：安装依赖

```bash
npm install @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-youtube @tiptap/extension-placeholder
```

### 步骤 2：创建数据层

- 创建 `src/data/newsDraft.ts`
- 实现草稿的 CRUD 操作
- 使用 localStorage 持久化

### 步骤 3：创建服务层

- 创建 `src/services/newsEditorService.ts`
- 封装发布逻辑
- 处理图片上传（本地模拟）

### 步骤 4：创建组件

按顺序创建：
1. `ImageUploader.vue` - 图片上传组件
2. `TagSelector.vue` - 标签选择器
3. `EditorToolbar.vue` - 编辑器工具栏
4. `RichTextEditor.vue` - 富文本编辑器
5. `NewsEditor.vue` - 新闻编辑页面

### 步骤 5：路由配置

在 `src/router/index.ts` 添加：

```typescript
{
  path: '/editor',
  name: 'newsEditor',
  component: () => import('../views/NewsEditor.vue'),
}
```

### 步骤 6：入口集成

在 Profile.vue 或其他页面添加「发布新闻」入口。

## 六、样式规范

遵循项目现有样式：

| 元素 | 样式 |
|------|------|
| 页面背景 | `bg-gray-50` |
| 卡片背景 | `bg-white` |
| 主色调 | `#D92E2E` |
| 标题字体 | `text-base font-semibold text-gray-900` |
| 辅助文字 | `text-sm text-gray-500` |
| 边框 | `border-gray-200` |
| 输入框 | `bg-gray-50 border border-gray-200 rounded-xl` |
| 主按钮 | `bg-[#D92E2E] text-white` |
| 次按钮 | `border border-gray-300 text-gray-700` |

## 七、交互细节

### 7.1 图片上传

- 支持格式：PNG、JPEG、GIF、WebP
- 最大尺寸：5MB
- 上传方式：点击选择 + 拖拽上传
- 预览：上传后显示缩略图

### 7.2 视频插入

- 支持 YouTube 链接
- 输入框 + 确认按钮
- 自动生成预览

### 7.3 草稿保存

- 手动保存：点击「存草稿」按钮
- 自动保存：每 30 秒自动保存一次
- 提示：保存成功显示 Toast

### 7.4 发布流程

1. 点击「发布」按钮
2. 验证必填字段
3. 显示预览确认
4. 发布成功跳转详情页

## 八、涉及文件

| 文件 | 操作 |
|------|------|
| `package.json` | 添加 Tiptap 依赖 |
| `src/data/newsDraft.ts` | 新建 |
| `src/services/newsEditorService.ts` | 新建 |
| `src/components/editor/RichTextEditor.vue` | 新建 |
| `src/components/editor/EditorToolbar.vue` | 新建 |
| `src/components/editor/ImageUploader.vue` | 新建 |
| `src/components/TagSelector.vue` | 新建 |
| `src/views/NewsEditor.vue` | 新建 |
| `src/router/index.ts` | 添加路由 |
| `src/views/Profile.vue` | 添加入口（可选） |

## 九、注意事项

1. **移动端适配**：编辑器工具栏需要适配小屏幕
2. **性能优化**：大文档时避免频繁自动保存
3. **数据验证**：发布前验证标题、内容必填
4. **错误处理**：上传失败、保存失败的用户提示
5. **样式一致性**：编辑器内容样式与新闻详情页保持一致
