# 财联社风格新闻详情页实现方案

## 一、设计目标

基于财联社 App 的新闻详情页设计，重构现有新闻详情页，打造专业、沉浸式、高可读性的财经新闻阅读体验。

***

## 二、财联社设计特点分析

### 2.1 布局结构

财联社新闻详情页采用**沉浸式阅读设计**：

```
┌─────────────────────────────────┐
│      Header（返回 + 标题 + 更多）  │  ← 固定顶部
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │   新闻头图（可选）        │   │
│  └─────────────────────────┘   │
│                                 │
│  标题（20px，加粗）              │
│                                 │
│  来源 | 时间 | 阅读量            │
│                                 │
├─────────────────────────────────┤
│                                 │
│  正文内容（17px，行高 1.8）       │
│  - 段落清晰                      │
│  - 重点加粗                      │
│  - 小标题分层                    │
│                                 │
├─────────────────────────────────┤
│  标签区（相关概念/板块）          │
├─────────────────────────────────┤
│  相关阅读（3-5 条推荐）           │
│  ┌─────────────────────────┐   │
│  │ 相关新闻 1               │   │
│  ├─────────────────────────┤   │
│  │ 相关新闻 2               │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 2.2 视觉风格

**配色方案（延续首页财联社风格）：**

```css
/* 主色调 */
--primary-red: #D92E2E;        /* 财联社红，用于强调、收藏 */
--text-primary: #1A1A1A;       /* 标题颜色 */
--text-content: #333333;       /* 正文颜色 */
--text-secondary: #666666;     /* 次要信息（来源、时间） */
--text-muted: #999999;         /* 弱化信息（阅读量） */

/* 背景色 */
--bg-primary: #FFFFFF;         /* 主背景 */
--bg-secondary: #F5F5F5;       /* 分割线、标签背景 */
```

**字体排印：**

```css
/* 标题 */
--title-size: 20px;            /* 新闻标题 */
--title-weight: 700;           /* 加粗 */
--title-line-height: 1.4;

/* 正文 */
--content-size: 17px;          /* 正文字号 */
--content-line-height: 1.8;    /* 行高 */
--content-spacing: 2em;        /* 段首缩进 */

/* 元信息 */
--meta-size: 13px;             /* 来源、时间 */
--meta-weight: 400;
```

### 2.3 核心特性

1. **沉浸式阅读**
   - 白色背景，黑色文字
   - 大字号（17px），宽松行高（1.8）
   - 段落清晰，段首缩进
2. **信息层次分明**
   - 标题 20px 加粗
   - 正文 17px
   - 元信息 13px 灰色
3. **交互功能完善**
   - 收藏/取消收藏（更多菜单）
   - 分享功能（更多菜单）
   - 相关阅读推荐
4. **专业财经风格**
   - 标签展示相关概念/板块
   - 重点内容加粗突出
   - 小标题分层（H2/H3）

***

## 三、现有代码分析

### 3.1 当前 NewsDetail.vue 问题

**位置：** `src/views/NewsDetail.vue`

**问题列表：**

1. **布局过于简单**
   - 缺少新闻头图展示
   - 正文区域无最大宽度限制
   - 缺少标签区和相关阅读
2. **视觉层次不够**
   - 标题字号偏小（text-xl = 1.25rem = 20px，但不够突出）
   - 正文字号偏小（prose-sm = 0.875rem = 14px）
   - 行间距不足
3. **功能缺失**
   - 无分享功能
   - 无相关阅读推荐
   - 无评论区
4. **内容格式化问题**
   - `formatContent()` 函数简单，未处理 HTML 标签
   - 使用 `v-html` 存在 XSS 风险

### 3.2 数据结构

**NewsDetail 接口（`src/data/news.ts`）：**

```typescript
export interface NewsDetail extends NewsItem {
  id: number
  title: string
  summary: string
  content: string        // HTML 格式
  publish_time: string
  source: string
  views: number
  has_image: boolean
  image_url?: string
  category: Category
  tags: Tag[]
}
```

***

## 四、实现方案

### 4.1 布局结构调整

**整体布局：**

```
┌─────────────────────────────────┐
│    Header（返回 + 更多菜单）       │  ← fixed top
├─────────────────────────────────┤
│  Main Content                   │
│  ├─ 头图（可选）                 │
│  ├─ 标题区                       │
│  ├─ 元信息（来源/时间/阅读）     │
│  ├─ 正文内容                     │
│  ├─ 标签区                       │
│  └─ 相关阅读                     │
└─────────────────────────────────┘
```

### 4.2 Header 组件设计

**布局：**

```
┌──────────────────────────────────────────────┐
│  [←]          新闻详情          [...]        │
│                           ↓ 展开菜单         │
│                    ┌──────────────┐          │
│                    │  [♡] 收藏    │          │
│                    │  [↗] 分享    │          │
│                    └──────────────┘          │
└──────────────────────────────────────────────┘
```

**实现细节：**

- 高度：`56px`
- 背景：白色，底部边框
- 左侧：返回按钮
- 中间：页面标题
- 右侧：更多按钮（三个点图标）
- 点击更多按钮展开下拉菜单
- 菜单包含：收藏（红色填充表示已收藏）、分享

**下拉菜单样式：**

- 位置：Header 右下角，absolute 定位
- 背景：白色，阴影
- 圆角：`8px`
- 内边距：`8px`
- 菜单项：垂直排列，间距 `4px`
- 图标：`20px`
- 文字：`14px`
- 悬停效果：`bg-gray-100`

### 4.3 新闻头图区

**条件渲染：**

```vue
<div v-if="news.has_image && news.image_url" class="news-image">
  <img :src="news.image_url" alt="" loading="lazy" />
</div>
```

**样式：**

- 宽度：100%
- 高度：自动（16:9 比例）
- 圆角：`8px`
- 懒加载：`loading="lazy"`

### 4.4 标题区

**布局：**

```
┌─────────────────────────────────┐
│  央行宣布降准 0.25 个百分点，      │
│  释放长期资金约 5000 亿元          │
│                                 │
│  财经日报  2 小时前  1.5w 阅读    │
└─────────────────────────────────┘
```

**样式：**

- 标题：`20px`, `font-bold (700)`, `leading-tight (1.25)`
- 来源：`text-[#D92E2E]`, `font-medium`
- 时间：`text-gray-500`
- 阅读量：`text-gray-400`

### 4.5 正文内容区（核心）

**样式要求：**

```css
.news-content {
  font-size: 17px;           /* 大字号，易读 */
  line-height: 1.8;          /* 宽松行高 */
  color: #333333;            /* 深灰色，舒适阅读 */
  text-align: justify;       /* 两端对齐 */
}

.news-content p {
  margin-bottom: 1.5em;      /* 段落间距 */
  text-indent: 2em;          /* 段首缩进 */
}

.news-content h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 2em 0 1em;
  color: #1A1A1A;
}

.news-content strong {
  font-weight: 600;
  color: #D92E2E;            /* 重点内容红色突出 */
}
```

**内容处理：**

- 支持 HTML 标签（`<p>`, `<h2>`, `<ul>`, `<li>`, `<strong>`）
- 使用 `marked` 库解析 Markdown（如果内容是 Markdown 格式）
- 对 HTML 进行 sanitize 处理（防止 XSS）

### 4.6 标签区

**布局：**

```
┌─────────────────────────────────┐
│  #A股  #银行  #降准  #货币政策   │
└─────────────────────────────────┘
```

**样式：**

- 标签背景：`bg-gray-100`
- 文字：`text-gray-700`
- 圆角：`rounded-full`
- 内边距：`px-3 py-1`
- 间距：`gap-2`

### 4.7 相关阅读区

**布局：**

```
┌─────────────────────────────────┐
│  相关阅读                         │
├─────────────────────────────────┤
│  • 央行今年第二次降准，专家解读   │
│  • 降准对股市有何影响？           │
│  • 银行股迎来利好，机构看好      │
└─────────────────────────────────┘
```

**实现：**

- 筛选同分类或同标签的新闻
- 显示 3-5 条
- 点击跳转到对应新闻详情

### 4.8 Header 下拉菜单

**布局：**

```
┌──────────────────────────────────────────────┐
│  [...]                                       │
│    ┌────────────────────┐                   │
│    │  [♡] 收藏          │                   │
│    │  [↗] 分享          │                   │
│    └────────────────────┘                   │
└──────────────────────────────────────────────┘
```

**实现细节：**

- 使用 `Popover` 或 `Dropdown` 组件
- 点击更多按钮触发
- 菜单项垂直排列
- 收藏状态：红色填充表示已收藏
- 点击菜单项后自动关闭

**样式：**

- 背景：`bg-white`
- 阴影：`shadow-lg`
- 圆角：`rounded-lg`
- 边框：`border border-gray-200`
- 内边距：`p-2`
- 菜单项：`flex items-center gap-3 px-3 py-2`
- 悬停：`hover:bg-gray-100`

***

## 五、技术实现细节

### 5.1 新增依赖

考虑添加 HTML sanitize 库：

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**使用：**

```typescript
import DOMPurify from 'dompurify'

const sanitizedContent = DOMPurify.sanitize(htmlContent)
```

### 5.2 内容格式化函数

**增强版** **`formatContent()`：**

```typescript
const formatContent = (content: string): string => {
  if (!content) return ''
  
  // 如果已经是 HTML，直接返回（经过 sanitize）
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h2', 'h3', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    })
  }
  
  // 如果是纯文本，转换为 HTML
  return content
    .split(/\n\s*\n/)
    .filter(para => para.trim())
    .map(para => {
      const cleanedPara = para
        .replace(/[ \t]+/g, ' ')
        .replace(/^[ \t]+/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Markdown 加粗
        .replace(/\n/g, '<br>')
      return `<p>${cleanedPara}</p>`
    })
    .join('')
}
```

### 5.3 分享功能

**使用 Web Share API：**

```typescript
const handleShare = async () => {
  if (!news.value) return
  
  const shareData = {
    title: news.value.title,
    text: news.value.summary,
    url: window.location.href
  }
  
  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.error('分享失败:', err)
    }
  } else {
    // 降级方案：复制链接
    await navigator.clipboard.writeText(window.location.href)
    alert('链接已复制')
  }
}
```

### 5.4 相关阅读推荐

**算法：**

```typescript
const getRelatedNews = (currentNews: NewsDetail): NewsItem[] => {
  // 1. 优先推荐同标签新闻
  const sameTags = newsList.filter(n => 
    n.id !== currentNews.id &&
    n.tags.some(t => currentNews.tags.some(ct => ct.id === t.id))
  )
  
  // 2. 其次推荐同分类新闻
  const sameCategory = newsList.filter(n => 
    n.id !== currentNews.id &&
    n.category.id === currentNews.category.id
  )
  
  // 3. 合并去重，取前 5 条
  const related = [...new Set([...sameTags, ...sameCategory])]
  return related.slice(0, 5)
}
```

### 5.5 下拉菜单实现

**使用 Lucide 图标：**

```typescript
import { MoreVertical, Heart, Share2 } from 'lucide-vue-next'
```

**状态管理：**

```typescript
const menuOpen = ref(false)
const isFavorited = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}
```

**模板结构：**

```vue
<div class="relative">
  <button @click="toggleMenu" class="p-2">
    <MoreVertical :size="20" />
  </button>
  
  <div v-if="menuOpen" 
       class="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200">
    <button @click="toggleFavorite; closeMenu()" class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100">
      <Heart :size="20" :fill="isFavorited ? 'currentColor' : 'none'" 
             :class="isFavorited ? 'text-red-500' : 'text-gray-500'" />
      <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
    </button>
    
    <button @click="handleShare; closeMenu()" class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100">
      <Share2 :size="20" class="text-gray-500" />
      <span>分享</span>
    </button>
  </div>
</div>
```

### 5.6 性能优化

1. **图片懒加载**
   ```vue
   <img :src="news.image_url" loading="lazy" />
   ```
2. **组件缓存**
   - 使用 `keep-alive` 缓存 NewsDetail 组件
   - 滚动位置保持
3. **防抖处理**
   - 收藏操作防抖（避免重复点击）
   - 分享操作防抖
4. **点击外部关闭菜单**
   - 监听点击事件，点击菜单外部时自动关闭

***

## 六、实现步骤（按优先级）

### Phase 1：核心布局（P0）

1. **重构 Header**
   - 添加分享图标
   - 优化收藏图标样式
   - 调整布局为三段式
2. **优化标题区**
   - 标题字号加大至 `20px`
   - 添加新闻头图展示
   - 元信息布局优化
3. **正文内容优化**
   - 正文字号调整为 `17px`
   - 行高调整为 `1.8`
   - 段落间距优化
   - 段首缩进

### Phase 2：功能增强（P1）

1. **标签区**
   - 展示新闻标签
   - 点击跳转相关搜索
2. **相关阅读**
   - 实现推荐算法
   - 展示 3-5 条相关新闻
   - 点击跳转
3. **Header 下拉菜单**
   - 更多按钮
   - 收藏功能
   - 分享功能

### Phase 3：细节打磨（P2）

1. **分享功能**
   - 实现 Web Share API
   - 降级方案：复制链接
2. **内容安全**
   - 添加 DOMPurify
   - sanitize HTML 内容
3. **性能优化**
   - 图片懒加载
   - 操作防抖

***

## 七、验收标准

### 7.1 视觉验收

- [ ] 标题 20px，加粗，醒目
- [ ] 正文 17px，行高 1.8，易读
- [ ] 段落清晰，段首缩进 2em
- [ ] 标签区展示完整
- [ ] 相关阅读布局美观
- [ ] Header 下拉菜单样式正确

### 7.2 功能验收

- [ ] 收藏/取消收藏正常
- [ ] 分享功能正常
- [ ] 相关阅读可点击跳转
- [ ] 图片懒加载生效
- [ ] 返回功能正常

### 7.3 性能验收

- [ ] 页面加载流畅
- [ ] 无明显卡顿
- [ ] TypeScript 类型检查通过
- [ ] 无编译错误

***

## 八、风险与注意事项

### 8.1 已知风险

1. **XSS 风险**
   - `v-html` 渲染用户可控内容
   - 解决方案：添加 DOMPurify sanitize
2. **图片加载失败**
   - 外部图片 URL 可能不稳定
   - 解决方案：添加错误处理，显示占位图
3. **分享 API 兼容性**
   - Web Share API 在部分浏览器不支持
   - 解决方案：降级方案（复制链接）

### 8.2 注意事项

1. **保持现有功能**
   - 收藏/历史记录功能不变
   - 浏览量统计不变
2. **数据层不变**
   - 仅修改 UI 层
   - 不改动 `data/` 和 `services/` 目录
3. **TypeScript 类型完整**
   - 所有新增代码保持类型完整
   - 不使用 `any` 类型

***

## 九、交付物

1. **修改的组件文件**
   - `src/views/NewsDetail.vue` - 全面重构
2. **新增工具函数**
   - `src/utils/format.ts` - `formatContent()` 增强版（可选）
3. **新增依赖（可选）**
   - `dompurify` - HTML sanitize

***

## 十、时间估算

| 阶段      | 任务           | 预计时间         |
| ------- | ------------ | ------------ |
| Phase 1 | Header 重构      | 15 分钟        |
| Phase 1 | 标题区优化        | 15 分钟        |
| Phase 1 | 正文内容优化       | 20 分钟        |
| Phase 2 | 标签区          | 10 分钟        |
| Phase 2 | 相关阅读         | 20 分钟        |
| Phase 2 | Header 下拉菜单   | 20 分钟        |
| Phase 3 | 分享功能         | 10 分钟        |
| Phase 3 | 内容安全         | 10 分钟        |
| **总计**  | <br />       | **约 2 小时** |

***

*方案制定时间：2026-03-23*\
*参考设计：财联社 App、UI Design Brain 最佳实践*
