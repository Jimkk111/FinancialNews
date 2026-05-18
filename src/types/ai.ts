export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LocalSession {
  sessionId: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export interface SessionInfo {
  sessionId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface SessionsListResponse {
  sessions: SessionInfo[]
}
