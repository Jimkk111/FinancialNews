import { describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// regression：toast.ts 曾在模块顶层 createDiscreteApi，同步渲染时执行
// useThemeStore，而 main.ts 的 import 阶段 pinia 尚未安装，导致启动即抛
// "getActivePinia() was called but there was no active Pinia"
describe('toast', () => {
  it('模块导入不依赖 active Pinia', async () => {
    vi.resetModules()
    await expect(import('../toast')).resolves.toBeTruthy()
  })

  it('首次调用时懒初始化 discrete API，可在组件树外使用', async () => {
    vi.resetModules()
    setActivePinia(createPinia())

    const { toast } = await import('../toast')
    expect(() => toast.error('hello')).not.toThrow()
    expect(() => toast.warning('hello')).not.toThrow()
  })
})
