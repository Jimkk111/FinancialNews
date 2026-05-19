import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { SessionInfo, ChatMessage } from '@/types'
import {
  createSession,
  getSessions,
  getSessionMessages,
  deleteSession,
  updateSessionTitle,
  chatCompletion,
  healthCheck
} from '@/services/aiService'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'streaming' | 'complete' | 'error'
}

export interface SessionGroup {
  label: string
  key: string
  sessions: SessionInfo[]
}

export const useAiSessionStore = defineStore('aiSession', () => {
  const sessions = ref<SessionInfo[]>([])
  const currentSessionId = ref<string | null>(null)
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const isSending = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const sidebarOpen = ref(false)
  const isServiceHealthy = ref<boolean | null>(null)

  const currentSession = computed(() =>
    sessions.value.find(s => s.sessionId === currentSessionId.value)
  )

  const filteredSessions = computed(() => {
    if (!searchQuery.value) return sessions.value
    const query = searchQuery.value.toLowerCase()
    return sessions.value.filter(s =>
      s.title.toLowerCase().includes(query)
    )
  })

  const groupedSessions = computed((): SessionGroup[] => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const lastWeek = new Date(today.getTime() - 604800000)

    const groups: SessionGroup[] = [
      { label: '今天', key: 'today', sessions: [] },
      { label: '昨天', key: 'yesterday', sessions: [] },
      { label: '本周', key: 'thisWeek', sessions: [] },
      { label: '更早', key: 'older', sessions: [] }
    ]

    const filtered = filteredSessions.value

    filtered.forEach(session => {
      const date = new Date(session.updatedAt)
      if (date >= today) {
        groups[0]!.sessions.push(session)
      } else if (date >= yesterday) {
        groups[1]!.sessions.push(session)
      } else if (date >= lastWeek) {
        groups[2]!.sessions.push(session)
      } else {
        groups[3]!.sessions.push(session)
      }
    })

    return groups.filter(g => g.sessions.length > 0)
  })

  const hasMessages = computed(() => messages.value.length > 0)

  async function checkHealth(): Promise<boolean> {
    try {
      const healthy = await healthCheck()
      isServiceHealthy.value = healthy
      return healthy
    } catch {
      isServiceHealthy.value = false
      return false
    }
  }

  function normalizeSession(s: any): SessionInfo {
    return {
      sessionId: s.sessionId || s.session_id || s.id || '',
      title: s.title || '未命名会话',
      createdAt: s.createdAt || s.created_at || new Date().toISOString(),
      updatedAt: s.updatedAt || s.updated_at || new Date().toISOString()
    }
  }

  async function loadSessions() {
    try {
      const data = await getSessions() as any
      const rawSessions = Array.isArray(data) ? data : (data?.sessions || data?.data || [])
      sessions.value = rawSessions.map(normalizeSession)

      localStorage.setItem('aiAssistantConversations', JSON.stringify(
        sessions.value.map(s => ({
          sessionId: s.sessionId,
          title: s.title,
          updatedAt: s.updatedAt
        }))
      ))
    } catch {
      const cachedConversations = localStorage.getItem('aiAssistantConversations')
      if (cachedConversations) {
        try {
          const parsed = JSON.parse(cachedConversations)
          sessions.value = parsed.map(normalizeSession)
        } catch {
          sessions.value = []
        }
      }
    }
  }

  function createNewSession() {
    if (isSending.value) return
    currentSessionId.value = null
    messages.value = []
    error.value = null
    localStorage.removeItem('aiAssistantLastSessionId')
  }

  async function selectSession(sessionId: string) {
    try {
      isLoading.value = true
      error.value = null

      const rawMessages = await getSessionMessages(sessionId) as any
      const sessionMessages: ChatMessage[] = Array.isArray(rawMessages)
        ? rawMessages
        : (rawMessages?.messages || rawMessages?.data || [])

      const formattedMessages: Message[] = sessionMessages.map((msg, index) => ({
        id: `${sessionId}-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
        status: 'complete' as const
      }))

      currentSessionId.value = sessionId
      messages.value = formattedMessages
      sidebarOpen.value = false

      localStorage.setItem('aiAssistantLastSessionId', sessionId)
    } catch (e) {
      console.error('selectSession failed:', e)
      error.value = '加载会话失败，请重试'
    } finally {
      isLoading.value = false
    }
  }

  async function removeSession(sessionId: string): Promise<boolean> {
    try {
      const success = await deleteSession(sessionId)
      if (success) {
        await loadSessions()

        if (sessionId === currentSessionId.value) {
          currentSessionId.value = null
          messages.value = []
          localStorage.removeItem('aiAssistantLastSessionId')
        }

        return true
      }
      return false
    } catch {
      error.value = '删除会话失败，请重试'
      return false
    }
  }

  async function renameSession(sessionId: string, title: string): Promise<boolean> {
    try {
      const success = await updateSessionTitle(sessionId, title)
      if (success) {
        await loadSessions()
        return true
      }
      return false
    } catch {
      error.value = '修改会话标题失败，请重试'
      return false
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || isSending.value) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'complete'
    }

    messages.value = [...messages.value, userMessage]
    isSending.value = true
    error.value = null

    let sessionIdValue = currentSessionId.value
    const aiMessageId = `ai-${Date.now()}`
    let currentContent = ''
    let hasCreatedMessage = false

    try {
      // 唯一的会话创建入口：发消息时才创建会话
      if (!sessionIdValue) {
        isLoading.value = true
        const newSessionId = await createSession()
        if (!newSessionId) {
          error.value = '创建会话失败，请重试'
          messages.value = messages.value.filter(m => m.id !== userMessage.id)
          return
        }
        sessionIdValue = newSessionId
        currentSessionId.value = newSessionId
        localStorage.setItem('aiAssistantLastSessionId', newSessionId)
        await loadSessions()
        isLoading.value = false
      }

      const chatMessages: ChatMessage[] = messages.value
        .filter(m => m.role === 'user' || m.status === 'complete')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      const response = await chatCompletion(
        chatMessages,
        sessionIdValue,
        true,
        (chunk) => {
          currentContent += chunk

          if (!hasCreatedMessage) {
            messages.value = [...messages.value, {
              id: aiMessageId,
              role: 'assistant',
              content: currentContent,
              timestamp: new Date(),
              status: 'streaming'
            }]
            hasCreatedMessage = true
          } else {
            messages.value = messages.value.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, content: currentContent }
                : msg
            )
          }
        }
      )

      if (response.sessionId && response.sessionId !== currentSessionId.value) {
        currentSessionId.value = response.sessionId
        localStorage.setItem('aiAssistantLastSessionId', response.sessionId)
      }

      if (hasCreatedMessage) {
        messages.value = messages.value.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: response.content || 'AI暂无回应', status: 'complete' }
            : msg
        )
      } else {
        messages.value = [...messages.value, {
          id: aiMessageId,
          role: 'assistant',
          content: response.content || 'AI暂无回应',
          timestamp: new Date(),
          status: 'complete'
        }]
      }

      await loadSessions()
    } catch {
      messages.value = messages.value.filter(m => m.id !== userMessage.id && m.id !== aiMessageId)
      error.value = '发送消息失败，请重试'
    } finally {
      isSending.value = false
      isLoading.value = false
    }
  }

  function clearMessages() {
    messages.value = []
  }

  function clearError() {
    error.value = null
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  async function init() {
    const healthy = await checkHealth()
    if (!healthy) {
      error.value = '后端服务不可用，请检查服务是否运行'
      return
    }

    await loadSessions()

    let targetSessionId = localStorage.getItem('aiAssistantLastSessionId')

    // 过滤掉旧代码可能写入的无效值
    if (!targetSessionId || targetSessionId === 'undefined' || targetSessionId === 'null') {
      targetSessionId = null
    }

    if (!targetSessionId && sessions.value.length > 0) {
      targetSessionId = sessions.value[0]!.sessionId
      if (targetSessionId) {
        localStorage.setItem('aiAssistantLastSessionId', targetSessionId)
      }
    }

    if (targetSessionId) {
      try {
        await selectSession(targetSessionId)
      } catch (e) {
        console.error('selectSession failed:', e)
        currentSessionId.value = null
        messages.value = []
        localStorage.removeItem('aiAssistantLastSessionId')
      }
    }
  }

  return {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    isSending,
    error,
    searchQuery,
    sidebarOpen,
    isServiceHealthy,
    currentSession,
    filteredSessions,
    groupedSessions,
    hasMessages,
    checkHealth,
    loadSessions,
    createNewSession,
    selectSession,
    removeSession,
    renameSession,
    sendMessage,
    clearMessages,
    clearError,
    toggleSidebar,
    closeSidebar,
    setSearchQuery,
    init
  }
})
