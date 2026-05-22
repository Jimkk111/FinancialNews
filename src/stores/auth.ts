import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserInfo } from '@/types'
import { logout as logoutApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  function init() {
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user_info')

    if (token && storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        localStorage.removeItem('user_info')
        localStorage.removeItem('access_token')
      }
    }
    loading.value = false
  }

  function login(token: string, userInfo: UserInfo) {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_info', JSON.stringify(userInfo))
    user.value = userInfo
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
      // 即使API调用失败，也要清除本地状态
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    user.value = null
  }

  function updateUser(userInfo: UserInfo) {
    localStorage.setItem('user_info', JSON.stringify(userInfo))
    user.value = userInfo
  }

  init()

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  }
})
