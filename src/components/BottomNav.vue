<script setup lang="ts">
import { Home, Bot, User } from 'lucide-vue-next'

interface Props {
  activeTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'home',
})

const emit = defineEmits<{
  tabChange: [tab: string]
}>()

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'ai', label: 'AI助手', icon: Bot },
  { id: 'profile', label: '个人', icon: User }
]

const handleTabClick = (id: string) => {
  emit('tabChange', id)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border px-4 py-2">
    <div class="flex items-center justify-around max-w-md mx-auto">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="[
          'flex flex-col items-center gap-0.5 py-1 px-6 transition-colors',
          activeTab === item.id ? 'text-brand' : 'text-muted-foreground'
        ]"
        @click="handleTabClick(item.id)"
      >
        <component
          :is="item.icon"
          :size="24"
          :stroke-width="activeTab === item.id ? 2.5 : 2"
        />
        <span :class="['text-[10px]', activeTab === item.id ? 'font-medium' : '']">
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>
