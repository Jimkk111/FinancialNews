<script lang="ts">
import { defineComponent, h, type PropType, type VNode } from 'vue'
import type { Inline } from '@/types/content'
import { sanitizeUrl } from '@/utils/content/sanitizeUrl'

/**
 * 内联渲染：把 Inline[] 渲染为文本 + 标记（strong/em/code/a）。
 * 用 render function 实现，便于任意标记组合的嵌套。
 */
function renderInline(node: Inline): VNode | string {
  if (node.type === 'hardBreak') return h('br')

  const marks = node.marks ?? []
  const has = (t: string) => marks.some((m) => m.type === t)

  let content: VNode | string = node.text

  if (has('code')) content = h('code', content)

  const link = marks.find((m) => m.type === 'link')
  if (link) {
    const href = sanitizeUrl(link.href)
    if (href) content = h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, content)
  }

  if (has('italic')) content = h('em', content)
  if (has('bold')) content = h('strong', content)

  return content
}

export default defineComponent({
  name: 'InlineText',
  props: {
    children: { type: Array as PropType<Inline[]>, required: true },
  },
  setup(props) {
    return () => props.children.map((node) => renderInline(node))
  },
})
</script>
