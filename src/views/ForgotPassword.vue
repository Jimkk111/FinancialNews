<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { sendCode, resetPassword, type ResetPasswordRequest } from '@/services/userService'

const router = useRouter()

const emit = defineEmits<{
  backToLogin: []
}>()

const username = ref('')
const email = ref('')
const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const codeLoading = ref(false)
const countdown = ref(0)
const isCodeSent = ref(false)

let countdownTimer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

const handleSendCode = async () => {
  error.value = ''
  success.value = ''

  if (!username.value.trim()) {
    error.value = '请输入用户名'
    return
  }

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
    const response = await sendCode(email.value, username.value)
    if (response.success) {
      isCodeSent.value = true
      error.value = ''
      success.value = '验证码已发送，请查收邮件'
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

const handleResetPassword = async (e: Event) => {
  e.preventDefault()
  error.value = ''
  success.value = ''

  if (!username.value.trim()) {
    error.value = '请输入用户名'
    return
  }

  if (!email.value.trim()) {
    error.value = '请输入邮箱'
    return
  }

  if (!code.value.trim()) {
    error.value = '请输入验证码'
    return
  }

  if (!password.value) {
    error.value = '请输入新密码'
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

    const resetRequest: ResetPasswordRequest = {
      username: username.value.trim(),
      email: email.value.trim(),
      code: code.value.trim(),
      password: password.value,
    }

    const response = await resetPassword(resetRequest)

    if (response.success) {
      success.value = '密码重置成功，请使用新密码登录'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = response.error?.message || '密码重置失败'
    }
  } catch (err) {
    error.value = '密码重置失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  emit('backToLogin')
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

        <h1 class="text-lg font-semibold text-foreground">找回密码</h1>

        <div class="w-8"></div>
      </div>
    </header>

    <main class="flex-1 pt-20 pb-6 px-4 overflow-y-auto">
      <div class="max-w-md mx-auto">
        <div class="bg-card rounded-2xl shadow-sm p-6 mb-4">
          <form @submit="handleResetPassword" class="space-y-4">
            <div v-if="error" class="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">
              {{ error }}
            </div>

            <div v-if="success" class="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-sm px-4 py-2 rounded-lg">
              {{ success }}
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                用户名
              </label>
              <input
                type="text"
                v-model="username"
                placeholder="请输入您的用户名"
                class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                :disabled="isCodeSent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                v-model="email"
                placeholder="请输入您的邮箱地址"
                class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                :disabled="isCodeSent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                验证码
              </label>
              <div class="relative">
                <input
                  type="text"
                  v-model="code"
                  placeholder="请输入6位验证码"
                  class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                />
                <button
                  type="button"
                  @click="handleSendCode"
                  :disabled="countdown > 0 || codeLoading"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700 disabled:text-muted-foreground disabled:cursor-not-allowed font-medium"
                >
                  {{ countdown > 0 ? `${countdown}s后重发` : codeLoading ? '发送中...' : '发送验证码' }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                新密码
              </label>
              <input
                type="password"
                v-model="password"
                placeholder="请输入新密码(8-128位,需含字母和数字)"
                class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                确认新密码
              </label>
              <input
                type="password"
                v-model="confirmPassword"
                placeholder="请再次输入新密码"
                class="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {{ loading ? '重置中...' : '确认重置' }}
            </button>
          </form>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="handleBack"
            class="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            返回登录
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
