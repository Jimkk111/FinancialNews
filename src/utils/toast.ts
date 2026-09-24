import { computed } from 'vue'
import { createDiscreteApi, darkTheme } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'

// ============================================================
// 全局消息提示
// discrete API 自带 Provider，store / 请求层等组件树之外的
// 模块也能直接调用；提示默认 3 秒自动消失，无需手动关闭。
// ============================================================

// 跟随应用明暗主题
const configProviderProps = computed(() => ({
  theme: useThemeStore().getAppliedTheme() === 'dark' ? darkTheme : null,
}))

const { message } = createDiscreteApi(['message'], { configProviderProps })

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
    if (!shouldSkip(text)) message.error(text, { duration: 4000 })
  },
  warning: (text: string) => {
    if (!shouldSkip(text)) message.warning(text)
  },
  success: (text: string) => {
    if (!shouldSkip(text)) message.success(text)
  },
  info: (text: string) => {
    if (!shouldSkip(text)) message.info(text)
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
