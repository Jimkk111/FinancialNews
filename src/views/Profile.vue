<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Heart, User, BookOpen, PenSquare, FileText, Send, Globe, X, Loader2 } from 'lucide-vue-next'
import BottomNav from '@/components/BottomNav.vue'
import Avatar from '@/components/Avatar.vue'
import Button from '@/components/ui/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { crawlNews } from '@/api/crawler'

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

// 爬取新闻相关状态
const showCrawlDialog = ref(false)
const crawlInstruction = ref('')
const crawlLoading = ref(false)
const crawlResult = ref<string | null>(null)
const crawlError = ref<string | null>(null)

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

const openCrawlDialog = () => {
  crawlInstruction.value = ''
  crawlResult.value = null
  crawlError.value = null
  showCrawlDialog.value = true
}

const closeCrawlDialog = () => {
  showCrawlDialog.value = false
}

const handleCrawl = async () => {
  if (!crawlInstruction.value.trim() || crawlLoading.value) return

  crawlLoading.value = true
  crawlResult.value = null
  crawlError.value = null

  try {
    const result = await crawlNews({ instruction: crawlInstruction.value.trim() })
    crawlResult.value = result.content
  } catch (err: any) {
    crawlError.value = err?.message || '爬取失败，请稍后重试'
  } finally {
    crawlLoading.value = false
  }
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

      <h3 class="text-sm font-semibold text-muted-foreground mb-2 mt-6 px-2">工具</h3>
      <div class="bg-card">
        <button
          class="w-full flex items-center justify-between px-4 py-4 hover:bg-muted active:bg-accent transition-colors"
          @click="openCrawlDialog"
        >
          <div class="flex items-center gap-3">
            <Globe :size="22" class="text-muted-foreground" />
            <span class="text-foreground font-medium">爬取新闻</span>
          </div>
          <ChevronRight :size="18" class="text-muted-foreground" />
        </button>
      </div>

      <div class="text-center text-muted-foreground text-xs mt-6 mb-4">
        <p>财经快讯 v1.0.0</p>
      </div>
    </div>

    <!-- 爬取新闻弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCrawlDialog"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/50" @click="closeCrawlDialog" />
          <div class="relative bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 class="text-lg font-semibold text-foreground">爬取新闻</h3>
              <button
                @click="closeCrawlDialog"
                class="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X :size="20" class="text-muted-foreground" />
              </button>
            </div>

            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">
                  输入爬取指令
                </label>
                <textarea
                  v-model="crawlInstruction"
                  placeholder="例如：帮我爬取财联社的最新财经新闻"
                  rows="3"
                  class="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  @keydown.ctrl.enter="handleCrawl"
                />
                <p class="text-xs text-muted-foreground mt-1">按 Ctrl+Enter 快速发送</p>
              </div>

              <Button
                variant="default"
                class="w-full"
                :disabled="!crawlInstruction.trim() || crawlLoading"
                @click="handleCrawl"
              >
                <Loader2 v-if="crawlLoading" :size="16" class="mr-2 animate-spin" />
                {{ crawlLoading ? '爬取中...' : '开始爬取' }}
              </Button>

              <div v-if="crawlResult" class="bg-muted rounded-lg p-4">
                <p class="text-sm font-medium text-foreground mb-2">执行结果</p>
                <p class="text-sm text-muted-foreground whitespace-pre-wrap">{{ crawlResult }}</p>
              </div>

              <div v-if="crawlError" class="bg-destructive/10 rounded-lg p-4">
                <p class="text-sm text-destructive">{{ crawlError }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <BottomNav active-tab="profile" @tab-change="handleTabChange" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
