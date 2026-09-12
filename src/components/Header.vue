<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { Bot, Home, Moon, Sun, User } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import { useThemeStore } from '@/stores/theme'

interface Props {
  avatar?: string | null
  /** 桌面端导航项（移动端隐藏，走底部导航） */
  navItems?: { id: string; label: string; icon?: unknown }[]
  /** 当前激活的导航项 */
  activeNav?: string
  /** 移动端隐藏（用于原本无顶栏的页面，如个人中心） */
  hideOnMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatar: null,
  navItems: () => [
    { id: 'home', label: '首页', icon: Home },
    { id: 'ai', label: 'AI助手', icon: Bot },
    { id: 'profile', label: '个人中心', icon: User },
  ],
  activeNav: 'home',
  hideOnMobile: false,
})

const emit = defineEmits<{
  userClick: []
  navClick: [id: string]
}>()

const themeStore = useThemeStore()
const appliedTheme = computed(() => themeStore.getAppliedTheme())

const getAvatarUrl = (avatarPath: string | null) => {
  if (!avatarPath) return null
  if (avatarPath.startsWith('blob:') || avatarPath.startsWith('http')) return avatarPath
  return avatarPath
}
</script>

<template>
  <header
    class="nb-app-header"
    :class="{ 'nb-app-header--hide-mobile': hideOnMobile }"
  >
    <div class="nb-app-header__inner">
      <div class="nb-app-header__left">
        <div class="nb-app-header__logo">
          <img class="nb-app-header__logo-img" src="@/assets/imgs/logo.png" alt="财经快讯" />
        </div>

        <nav v-if="navItems.length" class="nb-app-header__nav">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="nb-app-header__nav-item"
            :class="{ 'is-active': activeNav === item.id }"
            @click="emit('navClick', item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
      </div>

      <div class="nb-app-header__actions">
        <button
          class="nb-icon-btn"
          :title="appliedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
          @click="themeStore.toggleTheme()"
        >
          <n-icon :component="appliedTheme === 'dark' ? Sun : Moon" :size="17" />
        </button>

        <button class="nb-app-header__avatar" @click="emit('userClick')">
          <Avatar
            :src="getAvatarUrl(avatar || null) || undefined"
            alt="用户头像"
            :size="28"
          >
            <n-icon :component="User" :size="16" />
          </Avatar>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.nb-app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-header;
  height: $header-height;
  background-color: var(--nb-surface);
  border-bottom: 1px solid var(--nb-border);

  // 移动端隐藏（桌面端显示导航顶栏）
  &--hide-mobile {
    display: none;

    @include respond-to('md') {
      display: block;
    }
  }

  &__inner {
    height: 100%;
    max-width: 1280px;
    margin: 0 auto;
    @include flex(row, space-between, center);
    padding: 0 $sp-4;
  }

  &__left {
    @include flex(row, flex-start, center, $sp-4);
    min-width: 0;
  }

  &__logo {
    display: flex;
    align-items: center;
  }

  &__logo-img {
    height: 32px;
    width: auto;
    display: block;
  }

  // 桌面导航 —— 仅 ≥768px 显示
  &__nav {
    display: none;
    @include flex(row, flex-start, center, $sp-1);

    @include respond-to('md') {
      display: flex;
    }
  }

  &__nav-item {
    padding: $sp-1 $sp-3;
    font-size: $fs-base;
    color: var(--nb-text-secondary);
    border-radius: $radius-md;
    transition: background-color $dur-fast $ease, color $dur-fast $ease;

    &:hover {
      background-color: var(--nb-hover);
      color: var(--nb-text);
    }

    &.is-active {
      color: var(--nb-brand);
      font-weight: $fw-medium;
      background-color: var(--nb-brand-subtle);
    }
  }

  &__actions {
    @include flex(row, flex-end, center, $sp-1);
  }

  &__avatar {
    display: flex;
    padding: 0;
    border-radius: $radius-full;
    transition: opacity $dur-fast $ease;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
