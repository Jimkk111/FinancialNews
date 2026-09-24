import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { StreamChatHandle, StreamChatResult } from '@/api/ai'
import { ApiError } from '@/api/request'

vi.mock('@/services/aiService', () => ({
  createSession: vi.fn(),
  getSessions: vi.fn(),
  getSessionMessages: vi.fn(),
  deleteSession: vi.fn(),
  updateSessionTitle: vi.fn(),
  startStreamingChat: vi.fn(),
  healthCheck: vi.fn(),
}))

vi.mock('@/utils/toast', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
  errorMessage: vi.fn(),
}))

import { useAiSessionStore } from '../aiSession'
import { toast } from '@/utils/toast'
import {
  createSession,
  getSessions,
  getSessionMessages,
  startStreamingChat,
} from '@/services/aiService'

const createSessionMock = vi.mocked(createSession)
const getSessionsMock = vi.mocked(getSessions)
const getSessionMessagesMock = vi.mocked(getSessionMessages)
const startStreamingChatMock = vi.mocked(startStreamingChat)

/** 构造可控的流式 handle：测试中手动派发 chunk / 完成 / 中止 */
function createStreamHandle() {
  let capturedOnChunk: ((chunk: string) => void) | undefined
  let capturedResolve: ((result: StreamChatResult) => void) | undefined
  const abort = vi.fn()

  const handle: StreamChatHandle = {
    promise: new Promise<StreamChatResult>((resolve) => {
      capturedResolve = resolve
    }),
    abort,
  }

  return {
    handle,
    abort,
    onChunk: (chunk: string) => capturedOnChunk?.(chunk),
    resolve: (result: StreamChatResult) => capturedResolve?.(result),
    inject: () => {
      startStreamingChatMock.mockImplementation((_messages, _sessionId, onChunk) => {
        capturedOnChunk = onChunk
        return handle
      })
    },
  }
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe('useAiSessionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    getSessionsMock.mockResolvedValue([])
  })

  describe('sendMessage', () => {
    it('流式完成后消息落位、会话 ID 更新', async () => {
      createSessionMock.mockResolvedValue('sess-1')
      const stream = createStreamHandle()
      stream.inject()

      const store = useAiSessionStore()
      const sending = store.sendMessage('你好')
      await flushMicrotasks()

      expect(store.messages[0]!.role).toBe('user')

      stream.onChunk('部分')
      await flushMicrotasks()
      expect(store.messages[1]!.status).toBe('streaming')

      stream.resolve({ content: '完整回答', sessionId: 'sess-1', aborted: false })
      await sending

      expect(store.currentSessionId).toBe('sess-1')
      expect(store.messages).toHaveLength(2)
      expect(store.messages[1]!.content).toBe('完整回答')
      expect(store.messages[1]!.status).toBe('complete')
      expect(store.isSending).toBe(false)
    })

    it('停止生成保留已收到的部分回复', async () => {
      createSessionMock.mockResolvedValue('sess-1')
      const stream = createStreamHandle()
      stream.inject()

      const store = useAiSessionStore()
      const sending = store.sendMessage('写一篇长文')
      await flushMicrotasks()

      stream.onChunk('部分内容')
      await flushMicrotasks()

      store.stopGeneration()
      expect(stream.abort).toHaveBeenCalled()

      stream.resolve({ content: '部分内容', aborted: true })
      await sending

      expect(store.messages).toHaveLength(2)
      expect(store.messages[1]!.content).toBe('部分内容')
      expect(store.messages[1]!.status).toBe('complete')
      expect(store.error).toBeNull()
      expect(store.isSending).toBe(false)
    })

    it('未收到任何内容时停止则移除占位消息', async () => {
      createSessionMock.mockResolvedValue('sess-1')
      const stream = createStreamHandle()
      stream.inject()

      const store = useAiSessionStore()
      const sending = store.sendMessage('你好')
      await flushMicrotasks()

      store.stopGeneration()
      stream.resolve({ content: '', aborted: true })
      await sending

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]!.role).toBe('user')
    })

    it('请求失败时保留用户消息并弹出错误提示', async () => {
      createSessionMock.mockResolvedValue('sess-1')
      startStreamingChatMock.mockReturnValue({
        promise: Promise.reject(new ApiError('500', '模型服务过载')),
        abort: vi.fn(),
      })

      const store = useAiSessionStore()
      await store.sendMessage('你好')

      expect(toast.error).toHaveBeenCalledWith('模型服务过载')
      expect(store.error).toBeNull()
      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]!.role).toBe('user')
      expect(store.isSending).toBe(false)
    })

    it('空内容不触发发送', async () => {
      const store = useAiSessionStore()
      await store.sendMessage('   ')
      expect(startStreamingChatMock).not.toHaveBeenCalled()
    })

    it('切换会话后旧流结果不写入新会话', async () => {
      createSessionMock.mockResolvedValue('sess-1')
      getSessionMessagesMock.mockResolvedValue([])
      const stream = createStreamHandle()
      stream.inject()

      const store = useAiSessionStore()
      const sending = store.sendMessage('慢问题')
      await flushMicrotasks()

      // 模拟流式进行中用户切换到另一会话
      store.selectSession('sess-2')
      await flushMicrotasks()

      stream.onChunk('迟到的片段')
      stream.resolve({ content: '迟到的完整回复', aborted: false })
      await sending
      await flushMicrotasks()

      // sess-2 的消息列表为空，旧流结果被丢弃
      expect(store.messages).toHaveLength(0)
      expect(store.currentSessionId).toBe('sess-2')
    })
  })

  describe('regenerate', () => {
    it('移除最后一轮问答后重发用户消息', async () => {
      createSessionMock.mockResolvedValue('sess-1')
      const stream1 = createStreamHandle()
      stream1.inject()

      const store = useAiSessionStore()
      const first = store.sendMessage('第一问')
      await flushMicrotasks()
      stream1.resolve({ content: '第一答', aborted: false })
      await first
      expect(store.messages).toHaveLength(2)

      const stream2 = createStreamHandle()
      stream2.inject()
      const regenerating = store.regenerate()

      // 旧问答被移除，用户消息重新入列
      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]!.role).toBe('user')
      expect(store.messages[0]!.content).toBe('第一问')

      stream2.resolve({ content: '重新回答', aborted: false })
      await regenerating

      expect(store.messages).toHaveLength(2)
      expect(store.messages[1]!.content).toBe('重新回答')
    })
  })

  describe('会话列表', () => {
    it('groupedSessions 按时间分组', () => {
      const store = useAiSessionStore()
      const today = new Date()
      const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      store.sessions = [
        { sessionId: 'a', title: '今天', createdAt: '', updatedAt: today.toISOString() },
        { sessionId: 'b', title: '昨天', createdAt: '', updatedAt: new Date(midnight.getTime() - 3600_000).toISOString() },
        { sessionId: 'c', title: '本周', createdAt: '', updatedAt: new Date(midnight.getTime() - 3 * 86_400_000).toISOString() },
        { sessionId: 'd', title: '更早', createdAt: '', updatedAt: new Date(midnight.getTime() - 10 * 86_400_000).toISOString() },
      ]

      const groups = store.groupedSessions
      expect(groups.map((g) => g.key)).toEqual(['today', 'yesterday', 'thisWeek', 'older'])
      expect(groups[0]!.sessions[0]!.sessionId).toBe('a')
    })

    it('filteredSessions 按标题不区分大小写过滤', () => {
      const store = useAiSessionStore()
      store.sessions = [
        { sessionId: 'a', title: 'Stock Report', createdAt: '', updatedAt: '' },
        { sessionId: 'b', title: '量化策略', createdAt: '', updatedAt: '' },
      ]

      store.setSearchQuery('stock')
      expect(store.filteredSessions.map((s) => s.sessionId)).toEqual(['a'])

      store.setSearchQuery('量化')
      expect(store.filteredSessions.map((s) => s.sessionId)).toEqual(['b'])
    })
  })
})
