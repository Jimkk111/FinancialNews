# AI会话管理页面重构方案

## 一、现状分析

当前 `AIAssistant.vue` 存在以下问题：

| 问题类型 | 具体问题 |
|---------|---------|
| **代码组织** | 单文件546行，业务逻辑与UI高度耦合 |
| **状态管理** | 使用多个分散的 `ref`，未利用 Pinia |
| **用户体验** | 会话列表为侧边滑出式，无搜索/分组功能 |
| **交互设计** | 编辑/删除操作使用原生 `confirm`，体验粗糙 |
| **性能** | 无虚拟滚动，大量会话时可能卡顿 |
| **可维护性** | 类型定义分散，缺乏组件复用 |

---

## 二、设计理念

参考 **Linear** 的"Magical Utility"设计哲学，结合 **OpenAI** 的极简主义和 **Claude** 的温暖感：

- **深色主题优先**：AI助手场景适合沉浸式深色界面
- **内容为王**：让对话内容成为焦点，UI退居幕后
- **微交互反馈**：操作有即时视觉反馈，增加愉悦感
- **移动端优化**：手势操作、触摸友好、底部导航适配

---

## 三、架构重构

### 3.1 目录结构

```
src/
├── stores/
│   └── aiSession.ts              # 会话状态管理
├── views/
│   └── AIAssistant/
│       ├── index.vue             # 主入口
│       ├── ChatArea.vue          # 聊天区域
│       ├── SessionSidebar.vue    # 会话侧边栏
│       ├── SessionItem.vue       # 会话列表项
│       ├── MessageBubble.vue     # 消息气泡
│       ├── QuickActions.vue      # 快捷提问
│       └── InputArea.vue         # 输入区域
├── composables/
│   ├── useSession.ts             # 会话操作逻辑
│   └── useChat.ts                # 聊天逻辑
└── types/
    └── ai.ts                     # AI相关类型（已存在，需扩展）
```

### 3.2 状态管理设计

```typescript
// stores/aiSession.ts
import { defineStore } from 'pinia'
import type { SessionInfo, ChatMessage } from '@/types'

interface SessionState {
  sessions: SessionInfo[]
  currentSessionId: string | null
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  sidebarOpen: boolean
}

export const useSessionStore = defineStore('aiSession', {
  state: (): SessionState => ({
    sessions: [],
    currentSessionId: null,
    messages: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    sidebarOpen: false
  }),
  
  getters: {
    currentSession: (state) => 
      state.sessions.find(s => s.session_id === state.currentSessionId),
    
    filteredSessions: (state) => {
      if (!state.searchQuery) return state.sessions
      const query = state.searchQuery.toLowerCase()
      return state.sessions.filter(s => 
        s.title.toLowerCase().includes(query)
      )
    },
    
    groupedSessions: (state) => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 86400000)
      const lastWeek = new Date(today.getTime() - 604800000)
      
      return {
        today: state.sessions.filter(s => new Date(s.updated_at) >= today),
        yesterday: state.sessions.filter(s => {
          const date = new Date(s.updated_at)
          return date >= yesterday && date < today
        }),
        thisWeek: state.sessions.filter(s => {
          const date = new Date(s.updated_at)
          return date >= lastWeek && date < yesterday
        }),
        older: state.sessions.filter(s => new Date(s.updated_at) < lastWeek)
      }
    }
  },
  
  actions: {
    async loadSessions() { /* ... */ },
    async createSession() { /* ... */ },
    async selectSession(sessionId: string) { /* ... */ },
    async deleteSession(sessionId: string) { /* ... */ },
    async updateSessionTitle(sessionId: string, title: string) { /* ... */ },
    async sendMessage(content: string) { /* ... */ },
    clearError() { this.error = null },
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen }
  }
})
```

---

## 四、UI组件设计

### 4.1 主布局（移动端）

```
┌─────────────────────────────────────┐
│  Header (固定顶部)                   │
│  ┌─────────────────────────────────┐│
│  │ [≡]  AI助手              [+]   ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│                                     │
│         Chat Area (可滚动)          │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │     消息气泡区域                 ││
│  │                                 ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  快捷提问 (空状态时显示)         ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  Input Area (固定在底部导航上方)     │
│  ┌─────────────────────────────────┐│
│  │ [输入框...]              [发送] ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  BottomNav (底部导航)                │
│  [首页] [收藏] [AI] [我的]           │
└─────────────────────────────────────┘

侧边栏（左滑/点击菜单打开）：
┌──────────────────────┐
│ [搜索会话...]         │
├──────────────────────┤
│ 今天                  │
│  ├─ 如何选择基金？    │
│  └─ A股行情分析       │
├──────────────────────┤
│ 昨天                  │
│  └─ 量化交易入门      │
├──────────────────────┤
│ 更早                  │
│  └─ 新手理财指南      │
└──────────────────────┘
```

### 4.2 设计令牌

```css
/* 深色主题 - 参考 Linear */
:root {
  /* AI助手专用变量 */
  --ai-bg: #171717;
  --ai-surface: #212121;
  --ai-surface-hover: #2A2A2A;
  --ai-border: #2E2E32;
  --ai-text-primary: #FAFAFA;
  --ai-text-secondary: #8A8A8A;
  --ai-accent: #5E6AD2;        /* Linear Indigo */
  --ai-accent-glow: rgba(94, 106, 210, 0.15);
  --ai-user-bubble: #2F2F2F;
  --ai-assistant-bubble: transparent;
  --ai-gradient-start: #5E6AD2;
  --ai-gradient-end: #8B5CF6;
}

/* 光亮主题 */
.light {
  --ai-bg: #FAFAFA;
  --ai-surface: #FFFFFF;
  --ai-surface-hover: #F5F5F5;
  --ai-border: #E5E5E5;
  --ai-text-primary: #171717;
  --ai-text-secondary: #6B7280;
  --ai-user-bubble: #F3F4F6;
  --ai-assistant-bubble: transparent;
}
```

### 4.3 核心组件规格

#### SessionItem.vue - 会话列表项

```
普通状态:
┌─────────────────────────────────┐
│ 💬 如何选择基金？                │
│    今天 14:30                   │
└─────────────────────────────────┘

长按/右滑显示操作:
┌─────────────────────────────────┐
│ 💬 如何选择基金？    [编辑][删除]│
│    今天 14:30                   │
└─────────────────────────────────┘
```

#### MessageBubble.vue - 消息气泡

```
用户消息:
                    ┌──────────────────────────┐
                    │  今日A股行情如何？         │
                    └──────────────────────────┘
                                         14:30

AI消息:
┌─ ✨ AI助手 ─────────────────────────┐
│                                      │
│  今日A股市场整体呈现...               │
│  (支持Markdown渲染)                  │
│                                      │
│  [复制] [重新生成]                   │
└──────────────────────────────────────┘
                                 14:31
```

---

## 五、交互设计

### 5.1 手势操作（移动端）

| 手势 | 功能 |
|-----|------|
| 左滑会话项 | 显示编辑/删除按钮 |
| 长按会话项 | 弹出操作菜单 |
| 下拉消息区 | 刷新当前会话 |
| 点击空白处 | 收起侧边栏 |

### 5.2 动画规范

```css
/* 参考 Linear 的微交互 */
.session-item {
  transition: all 0.15s ease-out;
}

.session-item:active {
  background: var(--ai-surface-hover);
  transform: scale(0.98);
}

/* 消息出现动画 */
.message-enter {
  animation: messageSlideIn 0.2s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 流式输出光标 */
.streaming-cursor::after {
  content: '▊';
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 侧边栏滑入动画 */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease-out;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}
```

### 5.3 状态反馈

```typescript
// 操作状态枚举
enum ActionState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// Toast 通知系统（移动端底部弹出）
interface ToastOptions {
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number  // 默认 2000ms
}
```

### 5.4 删除确认弹窗

使用 ActionSheet 或 Dialog 组件替代原生 `confirm()`：

```vue
<!-- 删除确认弹窗 -->
<Dialog v-model:open="showDeleteDialog">
  <DialogContent>
    <DialogTitle>删除会话</DialogTitle>
    <DialogDescription>
      确定要删除「{{ sessionTitle }}」吗？此操作无法撤销。
    </DialogDescription>
    <DialogFooter>
      <Button variant="ghost" @click="showDeleteDialog = false">取消</Button>
      <Button variant="destructive" @click="confirmDelete">删除</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 六、功能增强

### 6.1 会话搜索

```vue
<!-- SessionSidebar.vue -->
<template>
  <div class="p-3">
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
      <input
        v-model="searchQuery"
        placeholder="搜索会话..."
        class="w-full pl-9 pr-3 py-2 bg-surface rounded-lg text-sm"
      />
    </div>
  </div>
</template>
```

### 6.2 会话分组

```typescript
// 按时间分组显示
const groupLabels = {
  today: '今天',
  yesterday: '昨天', 
  thisWeek: '本周',
  older: '更早'
}
```

### 6.3 消息操作

- **复制**：一键复制AI回复内容，显示 Toast 提示
- **重新生成**：重新请求AI回答
- **长按复制**：长按消息内容可复制

---

## 七、性能优化

### 7.1 虚拟滚动

```vue
<!-- 使用 radix-vue 的虚拟列表 -->
<VirtualList
  :items="messages"
  :item-size="80"
  :buffer="10"
>
  <template #default="{ item }">
    <MessageBubble :message="item" />
  </template>
</VirtualList>
```

### 7.2 懒加载

```typescript
// 会话消息分页加载
async function loadMoreMessages(sessionId: string, page: number) {
  const messages = await getSessionMessages(sessionId, { page, limit: 20 })
  // ...
}

// 触底加载更多
const { arrivedState } = useScroll(scrollRef)
watch(() => arrivedState.bottom, (isBottom) => {
  if (isBottom && hasMore) {
    loadMoreMessages(currentSessionId, nextPage)
  }
})
```

### 7.3 缓存策略

```typescript
// 使用 Pinia 持久化
import { defineStore } from 'pinia'
import { persist } from 'pinia-plugin-persistedstate'

export const useSessionStore = defineStore('aiSession', {
  // ...
  persist: {
    key: 'ai-sessions',
    paths: ['sessions', 'currentSessionId']
  }
})
```

### 7.4 移动端优化

- **触摸反馈**：所有可点击元素添加 `active:scale-95` 效果
- **安全区域**：适配 iOS 底部安全区域 `padding-bottom: env(safe-area-inset-bottom)`
- **防抖节流**：滚动、输入等高频操作添加防抖
- **图片懒加载**：消息中的图片使用懒加载

---

## 八、实施计划

| 阶段 | 任务 | 优先级 | 预计工作量 |
|-----|------|-------|-----------|
| **Phase 1** | 创建 Pinia Store，迁移状态管理 | 高 | 中 |
| **Phase 2** | 拆分组件 | 高 | 高 |
| **Phase 3** | 重构 SessionSidebar，添加搜索/分组 | 中 | 中 |
| **Phase 4** | 优化 MessageBubble，支持Markdown增强 | 中 | 中 |
| **Phase 5** | 添加手势操作和动画效果 | 中 | 中 |
| **Phase 6** | 性能优化（虚拟滚动、懒加载） | 低 | 中 |
| **Phase 7** | 移动端适配和测试 | 高 | 中 |

---

## 九、类型定义扩展

```typescript
// types/ai.ts 扩展
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'streaming' | 'complete' | 'error'
}

export interface Session {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  preview?: string  // 最后一条消息预览
}

export interface SessionGroup {
  label: string
  sessions: Session[]
}

export interface ToastOptions {
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}
```

---

## 十、技术栈确认

| 技术 | 用途 | 版本 |
|-----|------|-----|
| Vue 3 | 框架 | ^3.5.28 |
| Pinia | 状态管理 | ^3.0.4 |
| Tailwind CSS | 样式 | ^4.2.0 |
| radix-vue | UI组件 | ^1.9.17 |
| lucide-vue-next | 图标 | ^0.575.0 |
| marked | Markdown渲染 | ^17.0.3 |

---

## 十一、注意事项

1. **移动端优先**：所有组件设计以移动端体验为主，确保触摸友好
2. **渐进增强**：保持向后兼容，逐步替换现有功能
3. **性能监控**：关注首屏加载时间和内存占用
4. **无障碍**：确保屏幕阅读器可访问
5. **暗色模式**：默认使用深色主题，支持切换
