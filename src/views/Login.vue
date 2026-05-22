<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { login, type LoginRequest } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = ''

  if (!username.value.trim()) {
    error.value = '请输入用户名或邮箱'
    return
  }

  if (!password.value) {
    error.value = '请输入密码'
    return
  }

  if (password.value.length < 6) {
    error.value = '密码长度至少为6位'
    return
  }

  try {
    loading.value = true

    const loginRequest: LoginRequest = {
      username: username.value.trim(),
      password: password.value,
    }

    const response = await login(loginRequest)

    if (response.success && response.data) {

      authStore.login(response.data.access_token, response.data.user)

      router.push('/')
    } else {
      error.value = response.error?.message || '登录失败，请检查用户名和密码'
    }
  } catch (err) {
    error.value = '登录失败，请稍后重试'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-muted flex flex-col">
    <header class="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3">
      <div class="flex items-center justify-between max-w-md mx-auto">
        <button
          @click="handleBack"
          class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>

        <h1 class="text-lg font-semibold text-foreground">登录</h1>

        <div class="w-8"></div>
      </div>
    </header>

    <main class="flex-1 pt-20 pb-6 px-4 overflow-y-auto">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-foreground mb-2">欢迎回来</h1>
          <p class="text-muted-foreground text-sm">登录您的账号，继续精彩体验</p>
        </div>

        <div class="bg-card rounded-2xl shadow-sm p-6 mb-4">
          <form @submit="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                用户名或邮箱
              </label>
              <input
                type="text"
                v-model="username"
                placeholder="请输入用户名或邮箱"
                class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                密码
              </label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="请输入密码"
                  class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <EyeOff v-if="showPassword" :size="20" />
                  <Eye v-else :size="20" />
                </button>
              </div>
            </div>

            <div v-if="error" class="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">
              {{ error }}
            </div>

            <div class="flex items-center justify-end">
              <button
                type="button"
                @click="router.push('/forgot-password')"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                忘记密码？
              </button>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>
        </div>

        <div class="text-center">
          <span class="text-muted-foreground text-sm">还没有账号？</span>
          <button
            type="button"
            @click="router.push('/register')"
            class="text-blue-600 hover:text-blue-700 font-medium text-sm ml-1"
          >
            立即注册
          </button>
        </div>

      </div>
    </main>
  </div>
</template>
