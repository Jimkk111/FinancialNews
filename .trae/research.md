# 财经新闻项目前端研究报告

## 一、项目概览

- **技术栈**: Vue 3.5 + TypeScript + Vite 7 + Tailwind CSS 4 + Pinia
- **定位**: 移动端优先的财经新闻应用（单页应用）
- **当前状态**: 纯前端 Mock 模式，所有数据存储在 localStorage，无真实后端对接
- **核心功能**: 新闻浏览、搜索、收藏/历史、AI 助手、新闻编辑发布、用户认证

---

## 二、项目结构

```
src/
├── components/           # 可复用 UI 组件
│   ├── editor/           # 富文本编辑器组件 (TiptapEditor, ImageUploader, TagSelector)
│   ├── Header.vue        # 顶部导航栏
│   ├── BottomNav.vue     # 底部导航栏
│   ├── NewsList.vue      # 新闻列表（无限滚动）
│   ├── SearchBar.vue     # 搜索栏
│   ├── CategoryTabs.vue  # 分类标签栏
│   ├── Avatar.vue        # 头像组件
│   └── index.ts          # 组件统一导出
├── views/                # 页面级组件（13 个页面）
│   ├── Login.vue / Register.vue / ForgotPassword.vue
│   ├── NewsDetail.vue / SearchResults.vue
│   ├── Profile.vue / PersonalInfo.vue / Collection.vue / History.vue
│   ├── AIAssistant.vue
│   ├── NewsEditor.vue / Drafts.vue / MyPublished.vue
│   └── index.ts
├── services/             # 业务逻辑层（模拟 API 调用）
│   ├── userService.ts    # 用户认证、收藏、历史
│   ├── newsService.ts    # 新闻列表、详情、搜索
│   ├── aiService.ts      # AI 对话会话管理
│   └── newsEditorService.ts  # 草稿、发布管理
├── data/                 # 本地 Mock 数据层
│   ├── user.ts           # 用户数据库（默认用户 demo/123456）
│   ├── news.ts           # 100 条模拟新闻、8 个分类、10 个标签
│   ├── favorite.ts       # 收藏与历史管理
│   ├── ai.ts             # AI 会话与关键词响应
│   └── newsDraft.ts      # 草稿与发布存储
├── stores/auth.ts        # Pinia 全局认证状态
├── utils/format.ts       # 格式化工具（时间、浏览量）
├── styles/
│   ├── index.css         # Tailwind 主题配置 + 全局基础样式
│   └── tiptap.css        # Tiptap 编辑器样式
├── router/index.ts       # Vue Router 配置（已定义但未实际使用）
├── App.vue               # 根组件（手动页面状态管理）
└── main.ts               # 入口文件
```

---

## 三、风格与样式习惯

### 3.1 CSS 架构

- **Tailwind CSS 4.2** 通过 PostCSS 集成，使用 `@import 'tailwindcss' source(none)` + `@source` 指令
- **CSS 变量体系**: 在 `:root` 中定义完整的设计令牌（颜色、圆角、字重等），支持 `.dark` 暗色模式
- **颜色空间**: 使用 OkLCh 色彩空间定义部分颜色变量，确保感知一致性
- **组件样式**: 以 Tailwind 工具类为主，少量使用 `<style scoped>` 和内联样式

### 3.2 配色方案

| 用途 | 色值 | 使用方式 |
|------|------|----------|
| 主强调色 | `#D92E2E` | 激活状态、高亮、选中标签、Focus ring |
| 主文字色 | `#030213` | CSS 变量 `--primary` |
| 背景色 | `#ffffff` | 页面背景、卡片背景 |
| 灰色系 | Tailwind gray-50 ~ gray-900 | 边框、次要文字、背景、分割线 |
| 链接色 | `#2563eb` | 富文本编辑器中的链接 |
| 危险色 | `#d4183d` | 删除、错误提示 |

**注意**: 组件中大量硬编码 `#D92E2E` 而非使用 CSS 变量，与全局主题系统不一致。

### 3.3 布局模式

- **移动端优先**: 全局 `max-w-md mx-auto` 约束内容宽度
- **固定导航**: 顶部 Header (`fixed top-0 z-50 h-14`) + 底部 BottomNav (`fixed bottom-0 z-50`)
- **内容区**: `pt-14 pb-16` 避免被固定导航遮挡
- **粘性标签**: CategoryTabs 使用 `sticky top-14 z-40`

### 3.4 排版规范

| 层级 | 样式 | 用途 |
|------|------|------|
| 标题 | `text-2xl font-bold` | 登录欢迎语等 |
| 区块标题 | `text-lg font-semibold` | Header logo |
| 卡片标题 | `text-base font-semibold leading-6 line-clamp-2` | 新闻标题 |
| 正文 | `text-base font-normal` | 内容文字 |
| 标签 | `text-sm font-medium` | 表单标签 |
| 元数据 | `text-xs text-gray-500` | 时间、来源、浏览量 |

### 3.5 交互风格

- **圆角**: `rounded-lg`(8px) / `rounded-xl`(12px) / `rounded-full`
- **过渡**: 统一使用 `transition-colors`
- **悬停**: `hover:bg-gray-50` ~ `hover:bg-gray-200`
- **按下**: `active:bg-gray-100`
- **聚焦**: `focus:outline-none focus:ring-2 focus:ring-[#D92E2E] focus:border-transparent`
- **禁用**: `opacity-30` / `disabled:opacity-30`
- **加载**: `animate-spin` 旋转动画 + 文字提示

### 3.6 组件编码规范

- **Composition API**: 全部使用 `<script setup lang="ts">`
- **Props 类型**: `defineProps<Props>()` + `withDefaults`
- **事件类型**: `defineEmits<{ eventName: [args] }>()`
- **双向绑定**: `modelValue` prop + `update:modelValue` emit
- **图标库**: `lucide-vue-next`（大小 18-24px）
- **组件导出**: 通过 `index.ts` 统一导出

---

## 四、实现情况分析

### 4.1 路由与导航

**现状**: 定义了 Vue Router 但未在 `main.ts` 中注册使用。App.vue 通过 `currentPage` ref 手动管理页面切换，所有页面用 `v-if/v-else-if` 条件渲染。

```typescript
// App.vue 中的手动路由
const currentPage = ref<CurrentPage>('home')
// 13 个页面状态：home, detail, ai, profile, personalInfo, login, register,
// forgotPassword, search, collection, history, editor, drafts, myPublished
```

### 4.2 认证系统

- Pinia store (`auth.ts`) 管理登录状态
- localStorage 存储 `access_token` 和 `user_info`
- 默认测试用户: `demo / 123456 / demo@example.com`
- 验证码模拟: 6 位数字，5 分钟过期

### 4.3 数据层

所有 service 层函数通过 `delay(300 + Math.random() * 300)` 模拟网络延迟，调用 `data/` 层的本地函数操作 localStorage 数据。

```typescript
// 统一响应格式
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}
```

### 4.4 新闻系统

- 100 条预生成新闻，图片使用 Picsum 随机图片
- 8 个分类（股票、基金、债券、期货、外汇、加密货币、宏观经济、公司财报）
- 10 个标签（A 股、港股、美股、科技股等）
- 支持分页、分类筛选、关键词搜索
- 浏览量追踪（内存 Map）

### 4.5 AI 助手

- 基于关键词匹配的模拟 AI 回复
- 支持流式输出模拟（每 10 字符一块，30-80ms 间隔）
- 会话管理：创建、删除、重命名、历史记录
- Markdown 渲染（使用 `marked` 库）

### 4.6 新闻编辑器

- Tiptap 富文本编辑器，支持格式化、图片、链接、YouTube 嵌入
- 草稿自动保存（30 秒间隔）
- 草稿 → 发布流程
- 图片上传转 Base64 存储

---

## 五、存在的问题

### 5.1 架构问题

#### P1: 数据层与 Service 层职责混淆
- `data/` 层既包含原始数据定义，又包含业务操作函数
- `services/` 层仅添加延迟和格式转换，实际逻辑在 `data/` 层
- 两层之间的边界不清晰，未来对接真实 API 时需要大量重构

### 5.2 功能问题

#### P1: 密码明文存储
- `data/user.ts` 中密码以明文形式存储在 localStorage
- 虽然是 Mock 模式，但养成了不安全的数据处理习惯

#### P2: 浏览量不持久化
- `data/news.ts` 中浏览量存储在内存 Map 中（`const newsViews = new Map()`）
- 页面刷新后浏览量重置

#### P2: 头像 Blob URL 不持久
- 上传头像使用 `URL.createObjectURL()` 生成 blob URL
- Blob URL 在页面刷新后失效，头像会丢失

### 5.3 样式一致性问题（已解决）

#### P1: 强调色硬编码
- 组件中大量直接使用 `#D92E2E` 和 `text-[#D92E2E]`
- 未通过 CSS 变量或 Tailwind 主题色统一管理
- 如需更换品牌色，需要逐文件搜索替换

#### P2: 定义但未使用的 CSS 变量
- `index.css` 中定义了 sidebar、chart、popover 等大量变量
- 项目中并未使用这些变量，属于 shadcn/ui 模板残留
- `radix-vue`、`class-variance-authority`、`tailwind-merge` 等依赖已安装但几乎未使用

#### P2: 全局样式覆盖范围
- `@layer base` 中对 `h1-h4`、`label`、`button`、`input` 设置了全局样式
- 可能与 Tailwind 工具类或第三方组件库样式产生冲突

### 5.4 代码质量问题

#### P2: 未使用的依赖
- `axios` 已安装但可能未被使用（所有 API 调用已替换为本地 Mock）
- `radix-vue` 仅有 Avatar 组件使用，其余组件未使用 Radix

#### P2: uid 与 display_id 命名混乱（已解决）
- App.vue 中同时存在 `uid`（computed）和 `displayId`（computed），都取自 `display_id`
- 部分组件接收 `:uid="uid"` 但实际传递的是 `display_id`
- 注释说明"使用 display_id 替代原来的 uid"，但替换不彻底

#### P3: TypeScript 类型分散
- 接口定义分散在各个 `data/` 文件中
- 缺少统一的 `types/` 目录或类型文件
- 同一概念（如 NewsItem）在不同文件中可能有略微不同的类型定义

#### P3: 组件 index.ts 导出不完整
- `components/index.ts` 和 `views/index.ts` 可能未包含所有最新组件

### 5.5 性能问题

#### P2: 图片 Base64 存储
- 编辑器上传的图片转为 Base64 存储在 localStorage
- localStorage 有 5-10MB 大小限制，几张图片即可填满
- Base64 编码后体积增大约 33%

#### P3: 所有 Mock 新闻在内存中生成
- `data/news.ts` 在模块加载时生成 100 条完整新闻对象
- 包括完整的 HTML 内容，初始内存占用较大

### 5.6 工程化问题

#### P2: 无测试覆盖
- 无任何单元测试或 E2E 测试文件
- `tsconfig.node.json` 中引用了 `vitest.config.*`、`cypress.config.*`、`playwright.config.*` 但均不存在

#### P2: 环境变量全部清空
- `.env`、`.env.development`、`.env.production` 均只剩注释
- 注释说明"已迁移到本地模拟服务"，但未来对接后端时需要重新配置

#### P3: 页面标题未定制
- `index.html` 中 `<title>` 仍为 "Vite App"，未更改为项目名称

---

## 六、总结

### 优点
1. **TypeScript 全覆盖**: 所有文件使用 TypeScript，接口和类型定义较完善
2. **Composition API 规范**: 统一使用 `<script setup>` 语法
3. **层次分离**: services/data 分层设计，为后端对接预留了空间
4. **统一的错误响应格式**: `{ success, data, error }` 结构一致
5. **功能完整**: 覆盖了新闻浏览、编辑、用户系统、AI 助手等核心功能
6. **模拟延迟**: 模拟网络延迟使开发体验接近真实环境
7. **无限滚动实现优雅**: `NewsList.vue` 使用 Intersection Observer API 实现无限滚动，具备以下亮点：
   - **防重入锁机制**: `isLoadingLocked` 确保加载过程中不会触发重复请求，避免竞态条件
   - **智能 watch 分离**: categoryId 和 page 的 watch 职责明确，切换分类时不会产生重复请求
   - **预加载优化**: `rootMargin: '0px 0px 200px 0px'` 在用户滚动到底部前 200px 就开始加载，提升体验
   - **条件渲染哨兵**: 哨兵元素仅在 `hasMore` 为 true 时渲染，避免无意义的 Observer 回调
   - **自动重绑定**: 切换分类后通过 `nextTick(() => setupObserver())` 确保 Observer 正确绑定到新 DOM

### 改进优先级
3. **中优先级**: 统一 uid/display_id 命名
4. **低优先级**: 添加测试、优化图片存储方案
