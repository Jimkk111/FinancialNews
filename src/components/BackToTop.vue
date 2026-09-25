<template>
    <div class="container" :class="{ 'is-hidden': !visible }">
        <button class="click" type="button" aria-label="回到顶部" @click="goToTop">
            <n-icon :component="ArrowUp" :size="18" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { NIcon } from 'naive-ui'
import { ArrowUp } from 'lucide-vue-next'
import { debounce } from '@/utils/debounce'

// 停止滚动多久后隐藏按钮
const HIDE_DELAY = 800

const visible = ref(false)

const goToTop = () => {
    // 如果元素自身没有滚动条，则滚动的是最近的有滚动条的祖先元素
    // 这里，滚动的是window
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 滚动停止 HIDE_DELAY 毫秒后隐藏；期间再次滚动会重新计时
const hideWhenIdle = debounce(() => {
    visible.value = false
}, HIDE_DELAY)

// 滚动发生：立即显示；是否隐藏交给防抖计时器判断
const onScroll = () => {
    visible.value = true
    hideWhenIdle()
}

onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

// 按钮与视口右缘的间距；隐藏位移也要走完这段距离才能探出边界一半
$edge-offset: $sp-4;

.container{
    position: fixed;
    bottom: calc(#{$bottom-nav-height} + $sp-4);
    right: $edge-offset;
    z-index: $z-sticky;
    width: 36px;
    height: 36px;
    border-radius: $radius-full;
    border: 1px solid var(--nb-border);
    background-color: var(--nb-surface);
    box-shadow: var(--nb-shadow-sm);
    color: var(--nb-text-secondary);
    transition: transform $dur-base $ease, opacity $dur-base $ease,
        background-color $dur-fast $ease, color $dur-fast $ease;

    // 触屏设备点击后 :hover 会粘住（iOS 直至点击别处才清除），
    // 半隐藏状态会被粘住的 hover 样式压住而失效；
    // 悬停效果只对真正支持悬停的指针设备（鼠标/触控笔）生效
    @media (hover: hover) and (pointer: fine) {
        &:hover{
            background-color: var(--nb-hover);
            color: var(--nb-text);
        }

        &.is-hidden:hover{
            transform: none;
            opacity: 1;
        }
    }

    &:active{
        background-color: var(--nb-active);
    }

    // 隐藏态：滑到右边界，一半探出屏幕外
    // 50% 是自身宽度的一半，再走完 $edge-offset 的右边距，右缘正好越过视口一半
    &.is-hidden{
        transform: translateX(calc(50% + #{$edge-offset}));
        opacity: 0.5;
    }

    .click{
        @include flex(row, center, center);
        position: relative;
        width: 100%;
        height: 100%;
        padding: 0;
        border: none;
        border-radius: $radius-full;
        background: transparent;
        color: inherit;
        cursor: pointer;

        // 按钮滑回原位后，指针会停留在按钮右侧的屏幕边缘一带；
        // 这块隐形热区把悬停/点击区域延伸到屏幕右缘，避免 hover 丢失导致的来回抖动
        &::after{
            content: '';
            position: absolute;
            top: 0;
            left: 100%;
            width: 40px;
            height: 100%;
        }
    }
}
</style>
