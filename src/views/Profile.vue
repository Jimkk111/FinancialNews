<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Heart, User, BookOpen, PenSquare, FileText, Send } from 'lucide-vue-next'
import BottomNav from '@/components/BottomNav.vue'
import Avatar from '@/components/Avatar.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = computed(() => authStore.user?.username || '')
const avatar = computed(() => authStore.user?.avatar || null)

const menuItems = [
  { icon: PenSquare, label: '发布新闻', route: '/editor' },
  { icon: FileText, label: '草稿箱', route: '/drafts' },
  { icon: Send, label: '我的发布', route: '/my-published' },
  { icon: Heart, label: '我的收藏', route: '/collection' },
  { icon: BookOpen, label: '阅读历史', route: '/history' },
]

const getAvatarUrl = (avatarPath: string | null) => {
  if (!avatarPath) return null
  if (avatarPath.startsWith('blob:') || avatarPath.startsWith('http')) return avatarPath
  return avatarPath
}

const handleItemClick = (route: string) => {
  router.push(route)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleTabChange = (tab: string) => {
  const routePath = tab === 'home' ? '/' : `/${tab}`
  router.push(routePath)
}
</script>

<template>
  <div v-if="username" class="min-h-screen bg-muted pb-16">
    <div class="bg-card pt-8 pb-6 px-4">
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/profile/info')"
          class="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden bg-muted hover:bg-accent transition-colors"
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
        <div class="flex-1">
          <h2 class="text-xl font-bold text-foreground">{{ username }}</h2>
          <p class="text-sm text-muted-foreground mt-1">点击头像进入个人信息</p>
        </div>
      </div>
    </div>

    <div class="px-4 mt-4">
      <h3 class="text-sm font-semibold text-muted-foreground mb-2 px-2">我的服务</h3>
      <div class="bg-card">
        <template v-for="(item, index) in menuItems" :key="index">
          <button
            class="w-full flex items-center justify-between px-4 py-4 hover:bg-muted active:bg-accent transition-colors"
            @click="handleItemClick(item.route)"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" :size="22" class="text-muted-foreground" />
              <span class="text-foreground font-medium">{{ item.label }}</span>
            </div>
            <ChevronRight :size="18" class="text-muted-foreground" />
          </button>
          <div v-if="index < menuItems.length - 1" class="h-px bg-border mx-4" />
        </template>
      </div>

      <div class="text-center text-muted-foreground text-xs mt-6 mb-4">
        <p>财经快讯 v1.0.0</p>
      </div>
    </div>

    <BottomNav active-tab="profile" @tab-change="handleTabChange" />
  </div>
</template>
