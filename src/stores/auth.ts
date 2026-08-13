import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserInfo } from '@/types'
import { logout as logoutApi } from '@/api/auth'
import { getUserProfile } from '@/api/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  // 登录态由后端 HttpOnly Cookie 维护，前端 JS 无法读取该 Cookie。
  // 因此刷新页面时通过 GET /users/me 探测登录态，401 则视为未登录。
  let initPromise: Promise<void> | null = null

  async function fetchUser() {
    try {
      user.value = await getUserProfile()
    } catch {
      user.value = null
    }
  }

  function init(): Promise<void> {
    if (!initPromise) {
      initPromise = (async () => {
        try {
          await fetchUser()
        } finally {
          loading.value = false
        }
      })()
    }
    return initPromise
  }

  function login(userInfo: UserInfo) {
    user.value = userInfo
  }

  function clearAuth() {
    user.value = null
  }

  async function logout() {
    try {
      // 后端清除 HttpOnly Cookie
      await logoutApi()
    } catch {
      // 即使 API 调用失败，也清空本地登录态
    }
    user.value = null
  }

  function updateUser(userInfo: UserInfo) {
    user.value = userInfo
  }

  init()

  return {
    user,
    loading,
    isAuthenticated,
    init,
    login,
    logout,
    clearAuth,
    updateUser,
  }
})
