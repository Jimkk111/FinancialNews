<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import { formatViews } from '@/utils/format'

interface Props {
  id: number
  title: string
  source: string | null
  time: string
  views: number
}

defineProps<Props>()
const emit = defineEmits<{
  click: [id: number]
}>()
</script>

<template>
  <div
    class="bg-card cursor-pointer transition-colors hover:bg-muted active:bg-accent"
    @click="emit('click', id)"
  >
    <div class="flex gap-3 py-3 px-4">
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-foreground leading-6 line-clamp-2 mb-2">
          {{ title }}
        </h3>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 text-xs text-muted-foreground">
            <span class="font-medium">{{ source }}</span>
            <div class="flex items-center gap-1">
              <Clock :size="12" />
              <span>{{ time }}</span>
            </div>
          </div>
          <span class="text-xs text-muted-foreground/70">{{ formatViews(views) }}已阅读</span>
        </div>
      </div>
    </div>

    <div class="h-px bg-border" />
  </div>
</template>
