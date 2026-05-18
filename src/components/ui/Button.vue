<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'default' | 'destructive' | 'ghost' | 'outline'
type ButtonSize = 'default' | 'sm' | 'lg'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
}>(), {
  variant: 'default',
  size: 'default',
  disabled: false
})

const variantClasses = computed(() => {
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-foreground text-background hover:bg-foreground/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground'
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8'
  }
  return sizes[props.size]
})
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
      variantClasses,
      sizeClasses
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
