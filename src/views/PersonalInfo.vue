<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Camera } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import { uploadAvatar, type AvatarUploadResponse } from '@/services/userService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = computed(() => authStore.user?.username || '')
const displayId = computed(() => authStore.user?.displayId || '')
const email = computed(() => authStore.user?.email || '')
const avatar = computed(() => authStore.user?.avatar || null)

const isUploading = ref(false)
const error = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const getAvatarUrl = (avatarPath: string | null) => {
  if (!avatarPath) return null
  if (avatarPath.startsWith('blob:') || avatarPath.startsWith('http')) return avatarPath
  return avatarPath
}

const handleAvatarClick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = '请选择有效的图片文件（PNG、JPEG、GIF、WebP）'
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = '图片大小不能超过 5MB'
    return
  }

  error.value = ''
  isUploading.value = true

  try {
    const response = await uploadAvatar(file)
    if (response.success && response.data) {
      authStore.user = { ...authStore.user!, avatar: response.data.avatar }
    } else {
      error.value = response.error?.message || '头像上传失败'
    }
  } catch (err) {
    error.value = '头像上传失败，请稍后重试'
  } finally {
    isUploading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

const handleBack = () => {
  router.push('/profile')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-muted pb-20">
    <div class="bg-card shadow-sm sticky top-0 z-10">
      <div class="px-4 py-4 flex items-center justify-between">
        <button
          @click="handleBack"
          class="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
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
        <h1 class="text-xl font-bold text-foreground">个人信息</h1>
        <div class="w-8"></div>
      </div>
    </div>

    <div class="px-4 py-6">
      <div class="bg-card rounded-lg shadow-sm p-6">
        <div class="flex flex-col items-center mb-6">
          <div class="relative">
            <button
              @click="handleAvatarClick"
              :disabled="isUploading"
              class="w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow overflow-hidden bg-muted"
            >
              <Avatar
                :src="getAvatarUrl(avatar) || undefined"
                :alt="username"
                class="w-20 h-20"
              >
                <span class="bg-muted flex items-center justify-center w-full h-full">
                  <User class="text-muted-foreground" :size="40" />
                </span>
              </Avatar>
            </button>
            <div class="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <Camera class="text-white" :size="14" />
            </div>
            <div v-if="isUploading" class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            @change="handleFileChange"
            class="hidden"
          />
          <p class="text-xs text-muted-foreground mt-2">点击更换头像</p>
          <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
          <h2 class="text-xl font-bold text-foreground mt-2">{{ username }}</h2>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center py-3 border-b border-border">
            <span class="text-muted-foreground">ID</span>
            <span class="text-foreground font-medium">{{ displayId }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-border">
            <span class="text-muted-foreground">用户名</span>
            <span class="text-foreground font-medium">{{ username }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-border">
            <span class="text-muted-foreground">邮箱</span>
            <span class="text-foreground font-medium">{{ email }}</span>
          </div>
        </div>

        <div class="mt-8">
          <button
            @click="handleLogout"
            class="w-full py-3 bg-transparent text-red-600 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors border border-red-600"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
