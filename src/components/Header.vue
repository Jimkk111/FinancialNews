<script setup lang="ts">
import { computed } from 'vue'
import { Bell, Sun, Moon } from 'lucide-vue-next'
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
  <header class="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
    <div class="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
      <div class="flex items-center gap-3">

        <!-- 主题切换按钮 -->
        <button
          @click="themeStore.toggleTheme()"
          class="p-1 text-muted-foreground hover:bg-muted rounded-full transition-colors"
          :title="appliedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
        >
          <Sun v-if="appliedTheme === 'dark'" :size="20" />
          <Moon v-else :size="20" />
        </button>
      </div>

      <div class="flex items-center">
        <span class="text-lg font-bold text-brand">财经新闻</span>
      </div>

      <button
        type="button"
        class="w-8 h-8 rounded-full cursor-pointer overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500 border-0 p-0"
        @click="emit('userClick')"
      >
        <Avatar
          :src="getAvatarUrl(avatar || null) || undefined"
          alt="用户头像"
          class="w-8 h-8 pointer-events-none"
        >
          <span class="bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-medium pointer-events-none flex items-center justify-center w-full h-full">
            用户
          </span>
        </Avatar>
      </button>
    </div>
  </header>
</template>
