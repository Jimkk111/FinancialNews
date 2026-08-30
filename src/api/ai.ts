import { get, post, put, del, resolveUrl } from './request'
import type { ChatMessage, SessionInfo } from '@/types'

export async function createSession(): Promise<{ session_id: string }> {
  return post<{ session_id: string }>('/ai/sessions')
}

export async function getSessions(): Promise<SessionInfo[]> {
  return get<SessionInfo[]>('/ai/sessions')
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  return get<ChatMessage[]>(`/ai/sessions/${sessionId}/messages`)
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

export function createStreamingChat(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onComplete: (sessionId?: string) => void,
  onError: (error: Error) => void,
  sessionId?: string
): () => void {
  const controller = new AbortController()
  const IDLE_TIMEOUT = 30000 // 30秒无数据则超时

  const url = resolveUrl('/ai/chat/stream')

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      messages,
      sessionId,
    }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || '请求失败')
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/event-stream')) {
        throw new Error('响应不是流式数据')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应')
      }

      const decoder = new TextDecoder()
      let receivedSessionId: string | undefined
      let buffer = ''

      try {
        while (true) {
          // 空闲超时：若 IDLE_TIMEOUT 内无新数据到达，则中止请求
          const result = await Promise.race([
            reader.read(),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('流式响应超时')), IDLE_TIMEOUT)
            })
          ])

          if (result.done) break

          const chunk = decoder.decode(result.value, { stream: true })
          buffer += chunk

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            if (trimmed.startsWith('data:')) {
              const data = trimmed.slice(5).trim()
              if (data === '[DONE]') {
                onComplete(receivedSessionId)
                return
              }
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  onChunk(parsed.content)
                }
                if (parsed.sessionId) {
                  receivedSessionId = parsed.sessionId
                }
              } catch {
                // 非 JSON 数据行，跳过
              }
            }
          }
        }

        // 流已结束，处理剩余 buffer
        if (buffer.trim()) {
          const lines = buffer.split('\n')
          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('data:')) {
              const data = trimmed.slice(5).trim()
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.content) {
                    onChunk(parsed.content)
                  }
                  if (parsed.sessionId) {
                    receivedSessionId = parsed.sessionId
                  }
                } catch {
                  // skip
                }
              }
            }
          }
        }

        onComplete(receivedSessionId)
      } finally {
        controller.abort()
      }
    })
    .catch((error) => {
      onError(error)
    })

  return () => controller.abort()
}
