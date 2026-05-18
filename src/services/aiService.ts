import type { ChatMessage, SessionInfo } from '@/types'
import * as aiApi from '@/api/ai'

export async function createSession(): Promise<string> {
  const data = await aiApi.createSession()
  return data.session_id
}

export async function getSessions(): Promise<SessionInfo[]> {
  return aiApi.getSessions()
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  return aiApi.getSessionMessages(sessionId)
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await aiApi.deleteSession(sessionId)
    return true
  } catch {
    return false
  }
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
  try {
    await aiApi.updateSessionTitle(sessionId, title)
    return true
  } catch {
    return false
  }
}

export async function chatCompletion(
  messages: ChatMessage[],
  sessionId?: string,
  stream: boolean = false,
  onChunk?: (chunk: string) => void
): Promise<{ role: 'assistant'; content: string; sessionId?: string }> {
  if (stream && onChunk) {
    return new Promise((resolve, reject) => {
      let fullContent = ''
      
      aiApi.createStreamingChat(
        messages,
        (chunk) => {
          fullContent += chunk
          onChunk(chunk)
        },
        (receivedSessionId) => {
          resolve({ role: 'assistant', content: fullContent, sessionId: receivedSessionId })
        },
        (error) => {
          reject(error)
        },
        sessionId
      )
    })
  }

  const data = await aiApi.chatCompletion({
    messages,
    sessionId,
    stream: false,
  })
  
  return { role: 'assistant', content: data.content, sessionId: data.sessionId }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await aiApi.healthCheck()
    return true
  } catch {
    return false
  }
}

export type { ChatMessage, SessionInfo }
