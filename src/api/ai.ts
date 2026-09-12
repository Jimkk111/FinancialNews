import { get, post, put, del, resolveUrl, ApiError } from './request'
import type { ChatMessage, SessionInfo } from '@/types'
import { extractSseEvents } from '@/utils/sse'

// ============================================================
// 字段归一化
// 后端接口历史上存在 snake_case / camelCase 及包装结构混用，
// 统一在本层归一化为前端类型，service/store 不再做兜底转换。
// ============================================================

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function pickString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value) return value
  }
  return ''
}

export function normalizeSession(raw: unknown): SessionInfo {
  const source = asRecord(raw)
  const fallback = new Date().toISOString()
  return {
    sessionId: source ? pickString(source, ['sessionId', 'session_id', 'id']) : '',
    title: (source ? pickString(source, ['title']) : '') || '未命名会话',
    createdAt: source ? pickString(source, ['createdAt', 'created_at']) || fallback : fallback,
    updatedAt: source ? pickString(source, ['updatedAt', 'updated_at']) || fallback : fallback,
  }
}

/** 兼容 数组 / { sessions } / { data } 三种返回形态 */
function unwrapList(raw: unknown, keys: string[]): unknown[] {
  if (Array.isArray(raw)) return raw
  const source = asRecord(raw)
  if (!source) return []
  for (const key of keys) {
    const value = source[key]
    if (Array.isArray(value)) return value
  }
  return []
}

export function normalizeSessions(raw: unknown): SessionInfo[] {
  return unwrapList(raw, ['sessions', 'data']).map(normalizeSession)
}

export function normalizeChatMessages(raw: unknown): ChatMessage[] {
  return unwrapList(raw, ['messages', 'data'])
    .map((item) => {
      const source = asRecord(item)
      if (!source) return null
      const role = source.role === 'assistant' ? 'assistant' : 'user'
      const content = typeof source.content === 'string' ? source.content : ''
      return content ? ({ role, content } as ChatMessage) : null
    })
    .filter((item): item is ChatMessage => item !== null)
}

// ============================================================
// 会话管理
// ============================================================

export async function createSession(): Promise<{ sessionId: string }> {
  const data = await post<{ sessionId?: string; session_id?: string }>('/ai/sessions')
  return { sessionId: data.sessionId || data.session_id || '' }
}

export async function getSessions(): Promise<SessionInfo[]> {
  return normalizeSessions(await get<unknown>('/ai/sessions'))
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  return normalizeChatMessages(await get<unknown>(`/ai/sessions/${sessionId}/messages`))
}

export async function deleteSession(sessionId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/ai/sessions/${sessionId}`)
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<{ message: string }> {
  return put<{ message: string }>(`/ai/sessions/${sessionId}`, { title })
}

export async function chatCompletion(data: {
  messages: ChatMessage[]
  sessionId?: string
  stream?: boolean
}): Promise<{ content: string; sessionId: string }> {
  return post<{ content: string; sessionId: string }>('/ai/chat', data)
}

export async function healthCheck(): Promise<{ status: string }> {
  return get<{ status: string }>('/ai/health')
}

// ============================================================
// 流式对话
// 与 axios 主通道不同，SSE 走 fetch：这里单独对齐统一错误契约
// （{ code, msg } 响应壳）、401 登录态清理与空闲超时。
// ============================================================

export interface StreamChatResult {
  /** 累积的完整回复内容 */
  content: string
  sessionId?: string
  /** true 表示被调用方主动中止（保留已收到的部分内容） */
  aborted: boolean
}

export interface StreamChatHandle {
  promise: Promise<StreamChatResult>
  abort: () => void
}

const IDLE_TIMEOUT = 30_000 // 30 秒无新数据视为连接异常

function extractErrorMessage(body: unknown, status: number): string {
  const source = asRecord(body)
  if (source) {
    // 统一响应壳 { code, msg }，兼容旧格式 { error: { message } }
    const msg = source.msg
    if (typeof msg === 'string' && msg) return msg
    const error = asRecord(source.error)
    const message = error ? error.message : undefined
    if (typeof message === 'string' && message) return message
  }
  return `请求失败（${status}）`
}

function clearAuthState() {
  // 与 axios 拦截器保持一致：401 时清空内存登录态，由路由守卫拦截跳转登录页
  import('@/stores/auth')
    .then(({ useAuthStore }) => useAuthStore().clearAuth())
    .catch(() => {})
}

/** 带空闲超时的单次 read：超时主动 abort 连接并抛错，定时器保证被清理 */
function readWithIdleTimeout(reader: ReadableStreamDefaultReader<Uint8Array>, signal: AbortSignal) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return Promise.race([
    reader.read(),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new ApiError('408', 'AI 响应超时，请重试'))
        // 超时后中止底层连接，避免资源悬挂
        if (!signal.aborted) {
          try {
            reader.cancel().catch(() => {})
          } catch {
            // ignore
          }
        }
      }, IDLE_TIMEOUT)
    }),
  ]).finally(() => {
    if (timer !== undefined) clearTimeout(timer)
  })
}

export function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  sessionId?: string,
): StreamChatHandle {
  const controller = new AbortController()

  const promise = (async (): Promise<StreamChatResult> => {
    let content = ''
    let receivedSessionId: string | undefined

    const finalize = (aborted: boolean): StreamChatResult => ({
      content,
      sessionId: receivedSessionId,
      aborted,
    })

    try {
      const response = await fetch(resolveUrl('/ai/chat/stream'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages, sessionId }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        if (response.status === 401) clearAuthState()
        throw new ApiError(String(response.status), extractErrorMessage(body, response.status))
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/event-stream')) {
        throw new ApiError('500', '响应不是流式数据')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new ApiError('500', '无法读取响应')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      const consumeEvents = (events: string[]): boolean => {
        // 返回 true 表示流正常结束（收到 [DONE]）
        for (const data of events) {
          if (data === '[DONE]') return true
          try {
            const parsed = JSON.parse(data) as { content?: unknown; sessionId?: unknown }
            if (typeof parsed.content === 'string' && parsed.content) {
              content += parsed.content
              onChunk(parsed.content)
            }
            if (typeof parsed.sessionId === 'string' && parsed.sessionId) {
              receivedSessionId = parsed.sessionId
            }
          } catch {
            // 非 JSON 的 data 行，跳过
          }
        }
        return false
      }

      while (true) {
        const result = await readWithIdleTimeout(reader, controller.signal)
        if (result.done) break

        const { events, rest } = extractSseEvents(buffer + decoder.decode(result.value, { stream: true }))
        buffer = rest
        if (consumeEvents(events)) return finalize(false)
      }

      // 流结束但未收到 [DONE]，把残余不完整行也消费掉
      const { events } = extractSseEvents(buffer, true)
      consumeEvents(events)
      return finalize(false)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // 调用方主动停止：保留已收到的部分内容
        return finalize(true)
      }
      throw error
    }
  })()

  return { promise, abort: () => controller.abort() }
}
