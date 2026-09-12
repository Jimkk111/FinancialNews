import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // htmlToBlocks 依赖浏览器 DOMParser，统一跑在 happy-dom 环境
    environment: 'happy-dom',
  },
})
