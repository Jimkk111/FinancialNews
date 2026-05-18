/// <reference types="vite/client" />

declare module 'vue-virtual-scroller' {
  import type { DefineComponent } from 'vue'

  interface DynamicScrollerProps {
    items: unknown[]
    minItemSize: number
    keyField?: string
    pageMode?: boolean
    buffer?: number
    emitUpdate?: boolean
  }

  interface DynamicScrollerItemProps {
    item: unknown
    active: boolean
    sizeDependencies?: unknown[]
    watchData?: boolean
    tag?: string
    index?: number
    dataIndex?: number
  }

  export const DynamicScroller: DefineComponent<DynamicScrollerProps>
  export const DynamicScrollerItem: DefineComponent<DynamicScrollerItemProps>
  export const RecycleScroller: DefineComponent<DynamicScrollerProps>
  export const RecycleScrollerItem: DefineComponent<DynamicScrollerItemProps>
}
