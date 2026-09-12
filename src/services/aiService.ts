import type { ChatMessage, SessionInfo } from '@/types'
import * as aiApi from '@/api/ai'
import type { StreamChatHandle } from '@/api/ai'

export async function createSession(): Promise<string> {
  const { sessionId } = await aiApi.createSession()
  return sessionId
}

export async function getSessions(): Promise<SessionInfo[]> {
  return aiApi.getSessions()
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  return aiApi.getSessionMessages(sessionId)
}

export async function deleteSession(sessionId: string): Promise<void> {
  await aiApi.deleteSession(sessionId)
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  await aiApi.updateSessionTitle(sessionId, title)
}

export async function chatCompletion(
  messages: ChatMessage[],
  sessionId?: string,
): Promise<{ role: 'assistant'; content: string; sessionId?: string }> {
  const data = await aiApi.chatCompletion({ messages, sessionId, stream: false })
  return { role: 'assistant', content: data.content, sessionId: data.sessionId }
}

export function startStreamingChat(
  messages: ChatMessage[],
  sessionId: string | undefined,
  onChunk: (chunk: string) => void,
): StreamChatHandle {
  return aiApi.streamChat(messages, onChunk, sessionId)
}

export async function healthCheck(): Promise<void> {
  await aiApi.healthCheck()
}

export type { ChatMessage, SessionInfo }
