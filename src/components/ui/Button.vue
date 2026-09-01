<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

type ButtonVariant = 'default' | 'destructive' | 'ghost' | 'outline'
type ButtonSize = 'default' | 'sm' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    disabled?: boolean
  }>(),
  {
    variant: 'default',
    size: 'default',
    disabled: false,
  }
)

// 适配旧的 shadcn 风格 variant 命名到 naive-ui 的按钮语义
const naiveProps = computed(() => {
  switch (props.variant) {
    case 'destructive':
      return { type: 'error' as const, secondary: true, quaternary: false, ghost: false }
    case 'outline':
      return { type: 'default' as const, secondary: true, quaternary: false, ghost: false }
    case 'ghost':
      return { type: 'default' as const, secondary: false, quaternary: true, ghost: false }
    default:
      return { type: 'primary' as const, secondary: false, quaternary: false, ghost: false }
  }
})

const naiveSize = computed<'small' | 'medium' | 'large'>(() => {
  if (props.size === 'sm') return 'small'
  if (props.size === 'lg') return 'large'
  return 'medium'
})
</script>

<template>
  <n-button
    :type="naiveProps.type"
    :secondary="naiveProps.secondary"
    :quaternary="naiveProps.quaternary"
    :ghost="naiveProps.ghost"
    :size="naiveSize"
    :disabled="disabled"
  >
    <slot />
  </n-button>
</template>
