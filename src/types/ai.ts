export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SessionInfo {
  sessionId: string
  title: string
  createdAt: string
  updatedAt: string
}

/** 聊天气泡的视图模型（在 ChatMessage 基础上增加渲染所需的展示字段） */
export type MessageStatus = 'streaming' | 'complete'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: MessageStatus
}
