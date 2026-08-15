<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import CrawlerSources from './crawler/CrawlerSources.vue'
import CrawlerLogs from './crawler/CrawlerLogs.vue'

const router = useRouter()

const tabs = [
  { key: 'sources', label: '数据源' },
  { key: 'logs', label: '抓取日志' },
] as const

type TabKey = (typeof tabs)[number]['key']

const activeTab = ref<TabKey>('sources')

const handleBack = () => {
  router.push('/profile')
}
</script>

<template>
  <div class="min-h-screen bg-muted">
    <header class="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div class="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        <button @click="handleBack" class="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-lg font-semibold text-foreground">爬虫管理</h1>
        <div class="w-10"></div>
      </div>
    </header>

    <main class="pt-14 pb-8">
      <!-- Tab 切换 -->
      <div class="flex gap-4 px-4 max-w-4xl mx-auto border-b border-border bg-card">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === tab.key ? 'border-brand text-brand' : 'border-transparent text-muted-foreground'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="mt-4">
        <CrawlerSources v-if="activeTab === 'sources'" />
        <CrawlerLogs v-else />
      </div>
    </main>
  </div>
</template>
