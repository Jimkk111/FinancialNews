<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NInput, NModal, NSpin } from 'naive-ui'
import {
  BookOpen,
  ChevronRight,
  FileText,
  Globe,
  Heart,
  PenSquare,
  Send,
  User,
} from 'lucide-vue-next'
import BottomNav from '@/components/BottomNav.vue'
import Avatar from '@/components/Avatar.vue'
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
  <div v-if="username" class="nb-page profile">
    <header class="profile__hero">
      <div class="profile__hero-inner">
        <button
          class="profile__avatar-btn"
          title="进入个人信息"
          @click="router.push('/profile/info')"
        >
          <Avatar :src="getAvatarUrl(avatar) || undefined" :alt="username" :size="72">
            <n-icon :component="User" :size="32" />
          </Avatar>
        </button>
        <div class="profile__identity">
          <h2 class="profile__name">{{ username }}</h2>
          <p class="profile__tip">点击头像进入个人信息</p>
        </div>
      </div>
    </header>

    <main class="profile__body">
      <h3 class="nb-section-title profile__group-title">我的服务</h3>
      <div class="nb-card profile__group">
        <button
          v-for="(item, index) in menuItems"
          :key="item.route"
          class="profile__row"
          @click="handleItemClick(item.route)"
        >
          <span class="profile__row-left">
            <n-icon :component="item.icon" :size="20" />
            <span class="profile__row-label">{{ item.label }}</span>
          </span>
          <n-icon :component="ChevronRight" :size="18" />
          <span v-if="index < menuItems.length - 1" class="profile__row-divider" />
        </button>
      </div>

      <h3 class="nb-section-title profile__group-title">工具</h3>
      <div class="nb-card profile__group">
        <button class="profile__row" @click="openCrawlDialog">
          <span class="profile__row-left">
            <n-icon :component="Globe" :size="20" />
            <span class="profile__row-label">爬取新闻</span>
          </span>
          <n-icon :component="ChevronRight" :size="18" />
        </button>
      </div>

      <div class="profile__version">
        <p>财经快讯 v1.0.0</p>
      </div>
    </main>

    <n-modal
      v-model:show="showCrawlDialog"
      preset="card"
      title="爬取新闻"
      size="huge"
      :bordered="false"
      style="max-width: 520px"
    >
      <div class="crawl">
        <div class="nb-field">
          <label class="nb-field__label" for="crawl-instruction">输入爬取指令</label>
          <n-input
            id="crawl-instruction"
            v-model:value="crawlInstruction"
            type="textarea"
            :rows="3"
            placeholder="例如：帮我爬取财联社的最新财经新闻"
            @keydown.ctrl.enter="handleCrawl"
          />
          <p class="nb-field__hint">按 Ctrl+Enter 快速发送</p>
        </div>

        <n-button
          type="primary"
          block
          :disabled="!crawlInstruction.trim() || crawlLoading"
          :loading="crawlLoading"
          @click="handleCrawl"
        >
          开始爬取
        </n-button>

        <div v-if="crawlLoading" class="crawl__loading">
          <n-spin size="small" />
          <span>正在爬取，请稍候...</span>
        </div>

        <div v-if="crawlResult" class="crawl__result">
          <p class="crawl__result-title">执行结果</p>
          <p class="crawl__result-text">{{ crawlResult }}</p>
        </div>

        <p v-if="crawlError" class="nb-alert nb-alert--error">{{ crawlError }}</p>
      </div>
    </n-modal>

    <BottomNav active-tab="profile" @tab-change="handleTabChange" />
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.profile {
  background-color: var(--nb-bg-subtle);
  min-height: 100vh;
  padding-bottom: $bottom-nav-height;

  &__hero {
    background-color: var(--nb-surface);
    border-bottom: 1px solid var(--nb-border);
  }

  &__hero-inner {
    max-width: 640px;
    margin: 0 auto;
    @include flex(row, flex-start, center, $sp-4);
    padding: $sp-8 $sp-4 $sp-6;
  }

  &__avatar-btn {
    display: flex;
    border-radius: $radius-full;
    transition: opacity $dur-fast $ease;

    &:hover {
      opacity: 0.85;
    }
  }

  &__identity {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: $fs-2xl;
    font-weight: $fw-bold;
    color: var(--nb-text);
  }

  &__tip {
    margin-top: $sp-1;
    font-size: $fs-sm;
    color: var(--nb-text-secondary);
  }

  &__body {
    max-width: 640px;
    margin: 0 auto;
    padding: $sp-6 $sp-4;
  }

  &__group-title {
    margin: 0 0 $sp-2 $sp-2;

    & + .profile__group {
      margin-bottom: $sp-6;
    }
  }

  &__group {
    background-color: var(--nb-surface);
  }

  &__row {
    position: relative;
    @include flex(row, space-between, center);
    width: 100%;
    padding: $sp-4;
    color: var(--nb-text-tertiary);
    transition: background-color $dur-fast $ease;

    &:hover {
      background-color: var(--nb-hover);
    }

    &:active {
      background-color: var(--nb-active);
    }
  }

  &__row-left {
    @include flex(row, flex-start, center, $sp-3);
    min-width: 0;
  }

  &__row-label {
    font-size: $fs-base;
    font-weight: $fw-medium;
    color: var(--nb-text);
  }

  &__row-divider {
    position: absolute;
    left: $sp-4;
    right: $sp-4;
    bottom: 0;
    height: 1px;
    background-color: var(--nb-divider);
  }

  &__version {
    padding: $sp-6 0 $sp-4;
    text-align: center;
    font-size: $fs-xs;
    color: var(--nb-text-tertiary);
  }
}

.crawl {
  display: flex;
  flex-direction: column;
  gap: $sp-4;

  &__loading {
    @include flex(row, center, center, $sp-2);
    font-size: $fs-sm;
    color: var(--nb-text-secondary);
  }

  &__result {
    padding: $sp-4;
    background-color: var(--nb-surface-subtle);
    border-radius: $radius-md;
  }

  &__result-title {
    font-size: $fs-sm;
    font-weight: $fw-medium;
    color: var(--nb-text);
    margin-bottom: $sp-2;
  }

  &__result-text {
    font-size: $fs-sm;
    color: var(--nb-text-secondary);
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
