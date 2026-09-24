import { computed } from 'vue'
import { createDiscreteApi, darkTheme } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'

// ============================================================
// 全局消息提示
// discrete API 自带 Provider，store / 请求层等组件树之外的
// 模块也能直接调用；提示默认 3 秒自动消失，无需手动关闭。
// ============================================================

// createDiscreteApi 创建时会同步挂载独立 Vue 应用并读取
// configProviderProps（即执行 useThemeStore）。若在模块导入期执行，
// main.ts 还没跑到 app.use(pinia)，getActivePinia() 为空会直接抛错
// 导致启动白屏。因此延迟到首次弹提示时初始化，此时应用已完成挂载。
type MessageApi = ReturnType<typeof createDiscreteApi<'message'>>['message']

let messageApi: MessageApi | null = null

function getMessageApi(): MessageApi {
  if (messageApi) return messageApi

  // 跟随应用明暗主题
  const configProviderProps = computed(() => ({
    theme: useThemeStore().getAppliedTheme() === 'dark' ? darkTheme : null,
  }))

  messageApi = createDiscreteApi(['message'], { configProviderProps }).message
  return messageApi
}

// 短时间内相同文案去重，避免连续失败时弹出一串重复提示
let lastText = ''
let lastAt = 0

function shouldSkip(text: string): boolean {
  const now = Date.now()
  if (text === lastText && now - lastAt < 1500) return true
  lastText = text
  lastAt = now
  return false
}

export const toast = {
  error: (text: string) => {
    if (!shouldSkip(text)) getMessageApi().error(text, { duration: 4000 })
  },
  warning: (text: string) => {
    if (!shouldSkip(text)) getMessageApi().warning(text)
  },
  success: (text: string) => {
    if (!shouldSkip(text)) getMessageApi().success(text)
  },
  info: (text: string) => {
    if (!shouldSkip(text)) getMessageApi().info(text)
  },
}

/** 从未知异常中提炼可展示的文案；识别不了的用兜底文案，避免把技术性报错直接甩给用户 */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    if (err.message === 'Network Error') return '网络异常，请检查连接'
    if (err.message) return err.message
  }
  return fallback
}
