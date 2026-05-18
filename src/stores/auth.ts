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
        const parsedUser = JSON.parse(storedUser)
        // 映射id字段到displayId字段
        user.value = {
          ...parsedUser,
          displayId: parsedUser.displayId || parsedUser.id || parsedUser.uid,
          createdAt: parsedUser.createdAt || new Date().toISOString(),
          updatedAt: parsedUser.updatedAt || new Date().toISOString()
        }
      } catch {
        localStorage.removeItem('user_info')
        localStorage.removeItem('access_token')
      }
    }
    loading.value = false
  }

  function login(token: string, userInfo: UserInfo) {
    // 确保用户信息包含displayId字段
    const processedUserInfo = {
      ...userInfo,
      displayId: userInfo.displayId || userInfo.id || userInfo.uid,
      createdAt: userInfo.createdAt || new Date().toISOString(),
      updatedAt: userInfo.updatedAt || new Date().toISOString()
    }
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_info', JSON.stringify(processedUserInfo))
    user.value = processedUserInfo
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
    // 确保用户信息包含displayId字段
    const processedUserInfo = {
      ...userInfo,
      displayId: userInfo.displayId || userInfo.id || userInfo.uid,
      createdAt: userInfo.createdAt || new Date().toISOString(),
      updatedAt: userInfo.updatedAt || new Date().toISOString()
    }
    localStorage.setItem('user_info', JSON.stringify(processedUserInfo))
    user.value = processedUserInfo
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
