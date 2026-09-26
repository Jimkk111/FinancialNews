import type { AiSource, ChatMessage, SessionInfo } from '@/types'
import * as aiApi from '@/api/ai'
import type { StreamChatHandle, StreamChatOptions } from '@/api/ai'

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
  webSearch?: boolean,
): Promise<{
  role: 'assistant'
  content: string
  reasoning?: string
  sources?: AiSource[]
  sessionId?: string
}> {
  const data = await aiApi.chatCompletion({ messages, sessionId, webSearch, stream: false })
  return {
    role: 'assistant',
    content: data.content,
    reasoning: data.reasoning || undefined,
    sources: aiApi.normalizeSources(data.sources),
    sessionId: data.sessionId,
  }
}

export function startStreamingChat(
  messages: ChatMessage[],
  options: StreamChatOptions,
): StreamChatHandle {
  return aiApi.streamChat(messages, options)
}

export async function healthCheck(): Promise<void> {
  await aiApi.healthCheck()
}

export type { ChatMessage, SessionInfo }
