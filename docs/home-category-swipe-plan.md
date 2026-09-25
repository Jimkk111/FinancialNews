# 首页新闻分类左右滑动切换方案

> 状态：待实施
> 目标：在首页新闻列表区域左右滑动，按分类顺序切换上一个/下一个分类，tab 条高亮与居中联动。

## 一、现状分析

### 1.1 现有数据流

```
CategoryTabs（内部拉取分类接口、内部持有 activeCategory）
    └─ @category-change → Home.selectedCategoryId → NewsList :category-id
        └─ watch(categoryId) → 重置分页、重新请求
```

### 1.2 问题

| 问题类型 | 具体问题 |
|---------|---------|
| **状态孤岛** | 分类列表与选中项被锁在 CategoryTabs 内部，列表区域的手势无法获知"下一个分类是谁" |
| **重复状态** | `activeCategory`（组件内）与 `selectedCategoryId`（Home）各存一份，靠 emit 手工同步 |
| **重复请求** | CategoryTabs 每次挂载都请求分类接口，无缓存 |
| **交互缺失** | 不支持手势切换分类（本方案的核心目标） |

## 二、总体设计

**核心决策：分类状态上提至 Pinia store（`newsCategory`），组件全部改为读写同一真源。**

选择 store 而非 Home 本地状态的依据：

1. 项目惯例——已有 `aiSession` 等功能级 store 先例，架构自洽；
2. 消费者有三方（CategoryTabs 高亮 / 手势偏移 / NewsList 数据），store 免去 props 与事件的二传；
3. `next/prev` 边界钳制、请求去重等纯逻辑可脱离组件单测；
4. "当前新闻浏览上下文"具备跨页复用的成长空间（如搜索页按分类过滤）。

改造后的数据流：

```
newsCategory store（categories + activeCategoryId 唯一真源）
 ├─ CategoryTabs   ← 读 categories/activeId，点击调 switchTo；watch activeId 做 tab 居中
 ├─ NewsList       ← 仍由 Home 传 :category-id prop（保持"傻列表"，不直接读 store）
 └─ Home 手势监听   ← 横滑判定后调 switchByOffset(±1)
```

## 三、详细设计

### 3.1 Pinia store：`src/stores/newsCategory.ts`

```ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getNewsCategories } from '@/services/newsService'

interface Category {
  id: number
  name: string
}

export const useNewsCategoryStore = defineStore('newsCategory', () => {
  const categories = ref<Category[]>([])
  const activeCategoryId = ref<number | null>(null)
  const loading = ref(false)
  let loaded = false // 整个应用生命周期只请求一次

  // "全部" 不占用分类位，用 -1 表示，便于统一参与下标运算
  const CATEGORY_ALL = -1

  const items = computed(() => [
    { id: null as number | null, name: '全部' },
    ...categories.value,
  ])

  const activeIndex = computed(() =>
    items.value.findIndex(c => (c.id ?? CATEGORY_ALL) === (activeCategoryId.value ?? CATEGORY_ALL)),
  )

  async function fetchCategories() {
    if (loaded) return
    loading.value = true
    try {
      const response = await getNewsCategories()
      categories.value = (response as { data?: Category[] }).data ?? (response as Category[])
      loaded = true
    } finally {
      loading.value = false
    }
  }

  function switchTo(id: number | null) {
    if (id === activeCategoryId.value) return
    activeCategoryId.value = id
  }

  /** 手势入口：按当前下标偏移，边界钳制（第一个再右滑、最后一个再左滑均为 no-op） */
  function switchByOffset(offset: 1 | -1) {
    const index = activeIndex.value
    if (index < 0) return
    const next = items.value[index + offset]
    if (next) switchTo(next.id)
  }

  return { categories, activeCategoryId, loading, items, activeIndex, fetchCategories, switchTo, switchByOffset }
})
```

### 3.2 CategoryTabs：改为 store 连接组件

- 删除内部 `categories` 拉取、`activeCategory`、`emit`，改为：

```ts
const store = useNewsCategoryStore()
onMounted(() => { void store.fetchCategories() })
const handleCategoryClick = (id: number | null) => store.switchTo(id)
```

- 模板遍历 `store.items`，高亮判断 `store.activeCategoryId === category.id`；
- **tab 居中联动**（分类多时 tab 条是 `overflow-x: auto` 横滚容器，切换后高亮项需滚入视野）：

```ts
// 每个 tab 按钮加 :ref 收集，或用 data-id 查询
watch(() => store.activeCategoryId, async () => {
  await nextTick()
  activeTabEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
})
```

`block: 'nearest'` 必须保留，否则可能带动整页竖滚。

### 3.3 Home：手势监听

绑定在**新闻列表区域**（`main` 或其内层包裹元素，通过 ref 拿 DOM），不绑 tab 条（它自身是横滚容器，会冲突），不绑 window（会误伤顶栏/底栏上的滑动）：

```ts
const SWIPE_THRESHOLD = 60      // 最小水平位移
const DIRECTION_RATIO = 1.5     // |Δx| 需超过 |Δy| 的倍数（方向锁）

const categoryStore = useNewsCategoryStore()
let startX = 0
let startY = 0

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0]!.clientX
  startY = e.touches[0]!.clientY
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - startX
  const dy = e.changedTouches[0]!.clientY - startY
  if (Math.abs(dx) < SWIPE_THRESHOLD) return
  if (Math.abs(dx) < Math.abs(dy) * DIRECTION_RATIO) return
  categoryStore.switchByOffset(dx < 0 ? 1 : -1)  // 左滑下一个，右滑上一个
}

onMounted(() => {
  const el = mainRef.value
  el?.addEventListener('touchstart', onTouchStart, { passive: true })
  el?.addEventListener('touchend', onTouchEnd, { passive: true })
})
onUnmounted(() => { /* 对称移除，保存具名函数引用 */ })
```

要点：

| 约束 | 说明 |
|------|------|
| `passive: true` | 手势只读坐标不调 `preventDefault`，不阻塞页面竖向滚动 |
| 方向锁 | `|Δx| > 1.5 × |Δy|` 才判定为横滑，避免竖向浏览列表时误触发 |
| 阈值 60px | 约为常见屏宽的 15%，低于它视为点击/误触 |
| 边界钳制 | 不做循环切换（头条系惯例：到头即停） |
| Home 被 keep-alive | 用 `onMounted/onUnmounted` 不合适（不触发），需改用 `onActivated/onDeactivated` 挂载/移除监听 |

### 3.4 NewsList：保持不变

继续接收 `:category-id` prop，沿用现有 `watch(categoryId)` 重置分页并重新请求的逻辑。**不改为直接读 store**：列表组件保持受控展示器，可复用性与测试边界更好。骨架屏行为自动复用（分类切换时 `newsData` 清空 + `loading` 置真 → 骨架屏出现）。

## 四、边界情况

| 场景 | 处理 |
|------|------|
| 快速连续滑动 | NewsList 已有 `isLoadingLocked` 守卫；store 的 `switchTo` 同值短路 |
| 手势触发时列表正在加载 | 允许（切换会重置请求），骨架屏承接过渡 |
| 触摸起点在新闻条目上 | 无冲突——NewsItem 无横滚语义；点击与滑动由阈值区分 |
| iOS 边缘滑动（系统返回手势） | 系统手势优先于页面 touch 事件，实际不会误切分类 |
| 分类接口失败 | 沿用现有静默降级（tab 条只显示"全部"），手势自然只在"全部"内钳制 |

## 五、测试计划

`src/stores/__tests__/newsCategory.spec.ts`（mock `@/services/newsService`）：

1. `switchByOffset(1)` 从"全部"切到第一个分类；`(-1)` 在"全部"时为 no-op；
2. 最后一个分类 `switchByOffset(1)` 为 no-op（钳制）；
3. `fetchCategories` 二次调用不重复请求（loaded 守卫）；
4. `switchTo` 同值不产生变更（可用订阅 activeCategoryId 断言不触发）。

## 六、实施步骤（按提交划分）

| 步骤 | 内容 | 提交 |
|------|------|------|
| 1 | 新建 store + CategoryTabs 改造 + Home 接线替换 | `refactor: 新闻分类状态上提至 pinia store`（无行为变化） |
| 2 | 手势监听 + tab 居中联动 | `feat: 首页列表左右滑动切换新闻分类` |
| 3 | store 单元测试 | `test: 新闻分类 store 单测` |

步骤 1 完成后功能面与现状完全一致（纯重构），便于出问题时二分定位。

## 七、可选扩展（本期不做）

- **方向感知过渡动画**：NewsList 外套 `<Transition>`，按滑动方向决定列表从左/右滑入；
- **跟手拖拽**：touchmove 实时 transform 跟随、松手回弹/吸附，工程量大，需单独评估；
- **分类记忆**：activeCategoryId 持久化到 localStorage，重启恢复（参照 aiSession 的做法）。
