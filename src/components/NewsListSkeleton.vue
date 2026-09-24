<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 8,
})
</script>

<template>
  <!-- 骨架屏形状与 NewsItem 对应（两行标题 + 来源/时间/阅读数），
       内边距和分隔线也保持一致，加载完成后替换无跳动感 -->
  <div class="nb-news-skeleton" aria-hidden="true">
    <div v-for="n in count" :key="n" class="nb-news-skeleton__item">
      <div class="nb-news-skeleton__title">
        <div class="nb-news-skeleton__bar"></div>
        <div class="nb-news-skeleton__bar nb-news-skeleton__bar--short"></div>
      </div>
      <div class="nb-news-skeleton__meta">
        <div class="nb-news-skeleton__bar nb-news-skeleton__bar--source"></div>
        <div class="nb-news-skeleton__bar nb-news-skeleton__bar--time"></div>
        <div class="nb-news-skeleton__bar nb-news-skeleton__bar--views"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.nb-news-skeleton {
  // 扫光颜色：浅色主题向背景色（白）扫，深色主题向更亮的灰扫
  --sk-base: var(--nb-text-disabled);
  --sk-hl: var(--nb-surface);

  &__item {
    padding: $sp-3 $sp-4;
    border-bottom: 1px solid var(--nb-divider);

    // 奇偶行的短标题宽度错开，避免完全一致的占位显得呆板
    &:nth-child(even) .nb-news-skeleton__bar--short {
      width: 42%;
    }
  }

  &__title {
    @include flex(column, flex-start, flex-start, $sp-2);
    margin-bottom: $sp-2;
  }

  &__meta {
    @include flex(row, flex-start, center, $sp-3);
  }

  &__bar {
    height: 15px;
    border-radius: $radius-sm;
    background-color: var(--sk-base);
    background-image: linear-gradient(
      90deg,
      transparent 25%,
      var(--sk-hl) 50%,
      transparent 75%
    );
    background-size: 200% 100%;
    animation: nb-news-skeleton-sweep 1.4s $ease infinite;

    &:first-child {
      width: 100%;
    }

    &--short {
      width: 65%;
    }

    &--source {
      width: 64px;
      height: 12px;
    }

    &--time {
      width: 48px;
      height: 12px;
    }

    &--views {
      width: 40px;
      height: 12px;
      margin-left: auto;
    }
  }
}

@keyframes nb-news-skeleton-sweep {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

// 用户偏好减少动效时退化为静态占位
@media (prefers-reduced-motion: reduce) {
  .nb-news-skeleton__bar {
    animation: none;
  }
}
</style>
