import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ThemeMode } from '@/types'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getInitialTheme())

  function getSystemPreference(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  function getInitialTheme(): ThemeMode {
    const stored = localStorage.getItem('theme_mode') as ThemeMode | null
    return stored || 'system'
  }

  function getAppliedTheme(): 'light' | 'dark' {
    if (mode.value === 'system') {
      return getSystemPreference()
    }
    return mode.value
  }

  function applyTheme() {
    const applied = getAppliedTheme()
    const html = document.documentElement

    if (applied === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', applied === 'dark' ? '#1a1a1a' : '#ffffff')
    }
  }

  function setTheme(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem('theme_mode', newMode)
    applyTheme()
  }

  function toggleTheme() {
    const current = getAppliedTheme()
    setTheme(current === 'dark' ? 'light' : 'dark')
  }

  function setupSystemListener() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        if (mode.value === 'system') {
          applyTheme()
        }
      })
    }
  }

  function init() {
    applyTheme()
    setupSystemListener()
  }

  return {
    mode,
    getAppliedTheme,
    setTheme,
    toggleTheme,
    init,
  }
})
