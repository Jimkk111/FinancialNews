import request, { get, post, put, del } from './request'
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

  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const url = `${baseUrl}/ai/chat`
  const token = localStorage.getItem('access_token')
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      messages,
      sessionId,
      stream: true,
    }),
    signal: controller.signal,
  })
    .then(async (response) => {
      console.log('Streaming response status:', response.status)
      console.log('Content-Type:', response.headers.get('content-type'))
      console.log('Headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        throw new Error(errorData.error?.message || '请求失败')
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/event-stream')) {
        console.error('Expected text/event-stream, got:', contentType)
        throw new Error('响应不是流式数据')
      }
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应')
      }
      
      const decoder = new TextDecoder()
      let receivedSessionId: string | undefined
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        console.log('Raw chunk received:', JSON.stringify(chunk))
        
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              console.log('Stream completed')
              onComplete(receivedSessionId)
              return
            }
            try {
              const parsed = JSON.parse(data)
              console.log('Parsed data:', parsed)
              if (parsed.content) {
                onChunk(parsed.content)
              }
              if (parsed.sessionId) {
                receivedSessionId = parsed.sessionId
              }
            } catch (e) {
              console.log('Parse error:', e)
              console.log('Raw data causing error:', JSON.stringify(data))
            }
          }
        }
      }
      
      if (buffer) {
        console.log('Processing remaining buffer:', JSON.stringify(buffer))
        if (buffer.startsWith('data: ')) {
          const data = buffer.slice(6)
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data)
              console.log('Parsed final data:', parsed)
              if (parsed.content) {
                onChunk(parsed.content)
              }
            } catch (e) {
              console.log('Final parse error:', e)
            }
          }
        }
      }
      
      onComplete(receivedSessionId)
    })
    .catch((error) => {
      console.error('Streaming error:', error)
      onError(error)
    })
  
  return () => controller.abort()
}
