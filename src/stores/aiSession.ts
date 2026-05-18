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

  async function loadSessions() {
    try {
      const data = await getSessions()
      sessions.value = data

      const cached = JSON.stringify(data.map(s => ({
        sessionId: s.sessionId,
        title: s.title || '未命名会话',
        updatedAt: s.updatedAt
      })))
      localStorage.setItem('aiAssistantConversations', cached)
    } catch {
      const cachedConversations = localStorage.getItem('aiAssistantConversations')
      if (cachedConversations) {
        try {
          const parsed = JSON.parse(cachedConversations)
          sessions.value = parsed.map((s: any) => ({
            sessionId: s.sessionId,
            title: s.title || '未命名会话',
            createdAt: s.createdAt || new Date().toISOString(),
            updatedAt: s.updatedAt || new Date().toISOString()
          }))
        } catch {
          sessions.value = []
        }
      }
    }
  }

  async function createNewSession(): Promise<string | null> {
    if (currentSessionId.value && messages.value.length === 0) {
      return currentSessionId.value
    }

    try {
      isLoading.value = true
      error.value = null

      const healthy = await checkHealth()
      if (!healthy) {
        error.value = '后端服务不可用，请检查服务是否运行'
        return null
      }

      const sessionId = await createSession()
      if (!sessionId) {
        error.value = '创建新会话失败，未获取到会话ID'
        return null
      }
      currentSessionId.value = sessionId
      messages.value = []
      localStorage.setItem('aiAssistantLastSessionId', sessionId)

      await loadSessions()
      return sessionId
    } catch {
      error.value = '创建新会话失败，请重试'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function selectSession(sessionId: string) {
    try {
      isLoading.value = true
      error.value = null

      const sessionMessages = await getSessionMessages(sessionId)

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
    } catch {
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
    let aiMessageId = `ai-${Date.now()}`
    let currentContent = ''
    let hasCreatedMessage = false

    try {
      if (!sessionIdValue) {
        const newSessionId = await createSession()
        sessionIdValue = newSessionId
        currentSessionId.value = newSessionId
        localStorage.setItem('aiAssistantLastSessionId', newSessionId)
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
            const aiMessage: Message = {
              id: aiMessageId,
              role: 'assistant',
              content: currentContent,
              timestamp: new Date(),
              status: 'streaming'
            }
            messages.value = [...messages.value, aiMessage]
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
        const aiMessage: Message = {
          id: aiMessageId,
          role: 'assistant',
          content: response.content || 'AI暂无回应',
          timestamp: new Date(),
          status: 'complete'
        }
        messages.value = [...messages.value, aiMessage]
      }

      await loadSessions()
    } catch {
      if (hasCreatedMessage) {
        messages.value = messages.value.slice(0, -1)
      }
      messages.value = messages.value.slice(0, -1)
      error.value = '发送消息失败，请重试'
    } finally {
      isSending.value = false
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

    localStorage.removeItem('aiAssistantConversations')
    await loadSessions()

    const lastSessionId = localStorage.getItem('aiAssistantLastSessionId')
    if (lastSessionId) {
      try {
        await selectSession(lastSessionId)
      } catch {
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
