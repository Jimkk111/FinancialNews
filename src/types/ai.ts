export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  /** 思考型模型的完整思考链：仅历史消息归一化时填充，不回传后端 */
  reasoning?: string
  /** 联网搜索引用来源：仅历史消息归一化时填充，不回传后端；下标与正文 [n] 引用对应 */
  sources?: AiSource[]
}

/** 联网搜索引用来源 */
export interface AiSource {
  title: string
  url: string
  summary?: string
  siteName?: string
  publishTime?: string
  logoUrl?: string
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
  /** 思考链增量拼接结果，非思考型模型为空 */
  reasoning?: string
  /** 思考耗时（秒），正文开始到达时记录，用于「已深度思考（用时 X 秒）」 */
  reasoningSeconds?: number
  /** 联网搜索引用来源，未开搜索或模型未触发搜索时缺失 */
  sources?: AiSource[]
  timestamp: Date
  status?: MessageStatus
}
