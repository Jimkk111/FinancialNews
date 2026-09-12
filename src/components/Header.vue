<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { Moon, Sun, User } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import { useThemeStore } from '@/stores/theme'

interface Props {
  avatar?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  userClick: []
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
  <header class="nb-app-header">
    <div class="nb-app-header__logo">
      <img class="nb-app-header__logo-img" src="@/assets/imgs/logo.png" alt="财经快讯" />
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $sp-4;
  background-color: var(--nb-surface);
  border-bottom: 1px solid var(--nb-border);

  &__logo {
    display: flex;
    align-items: center;
  }

  &__logo-img {
    height: 32px;
    width: auto;
    display: block;
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
