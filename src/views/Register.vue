<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import {
  register,
  sendCode,
  type RegisterRequest,
} from '@/services/userService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const code = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const codeSent = ref(false)
const codeLoading = ref(false)
const countdown = ref(0)

let countdownTimer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

const handleSendCode = async () => {
  if (!email.value.trim()) {
    error.value = '请输入邮箱'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = '请输入有效的邮箱格式'
    return
  }

  try {
    codeLoading.value = true
    const response = await sendCode(email.value)
    if (response.success) {
      codeSent.value = true
      error.value = ''
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer!)
          countdownTimer = null
        }
      }, 1000)
    } else {
      error.value = response.error?.message || '发送验证码失败'
    }
  } catch (err) {
    error.value = '发送验证码失败，请稍后重试'
  } finally {
    codeLoading.value = false
  }
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = ''

  if (!username.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value || !code.value.trim()) {
    error.value = '所有字段均为必填项'
    return
  }

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,49}$/
  if (!usernameRegex.test(username.value.trim())) {
    error.value = '用户名需3-50字符，字母开头，仅含字母数字下划线'
    return
  }

  if (password.value.length < 8 || password.value.length > 128) {
    error.value = '密码长度需为8-128字符'
    return
  }

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/
  if (!passwordRegex.test(password.value)) {
    error.value = '密码需包含字母和数字'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  const codeRegex = /^\d{6}$/
  if (!codeRegex.test(code.value.trim())) {
    error.value = '验证码需为6位数字'
    return
  }

  try {
    loading.value = true

    const registerRequest: RegisterRequest = {
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
      code: code.value.trim(),
    }

    const response = await register(registerRequest)

    if (response.success && response.data) {
      authStore.login(response.data.access_token, response.data.user)
      router.push('/')
    } else {
      error.value = response.error?.message || '注册失败'
    }
  } catch (err) {
    error.value = '注册失败，请稍后重试'
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

        <h1 class="text-lg font-semibold text-foreground">注册</h1>

        <div class="w-8"></div>
      </div>
    </header>

    <main class="flex-1 pt-20 pb-6 px-4 overflow-y-auto">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-foreground mb-2">创建新账号</h1>
          <p class="text-muted-foreground text-sm">加入我们，探索更多精彩</p>
        </div>

        <div class="bg-card rounded-2xl shadow-sm p-6 mb-4">
          <form @submit="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">用户名</label>
              <input
                type="text"
                v-model="username"
                placeholder="请输入用户名"
                class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">邮箱</label>
              <input
                type="email"
                v-model="email"
                placeholder="请输入邮箱"
                class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">验证码</label>
              <div class="flex space-x-2">
                <input
                  type="text"
                  v-model="code"
                  placeholder="请输入6位验证码"
                  class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                />
                <button
                  type="button"
                  @click="handleSendCode"
                  :disabled="codeLoading || countdown > 0"
                  class="w-40 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {{ codeLoading ? '发送中...' : countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">密码</label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="请输入8-128位密码(需含字母和数字)"
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

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">确认密码</label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="confirmPassword"
                  placeholder="请再次输入密码"
                  class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                />
              </div>
            </div>

            <div v-if="error" class="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </form>
        </div>

        <div class="text-center">
          <span class="text-muted-foreground text-sm">已有账号？</span>
          <button
            type="button"
            @click="router.push('/login')"
            class="text-blue-600 hover:text-blue-700 font-medium text-sm ml-1"
          >
            立即登录
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
