import { useCallback, useEffect, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cn } from '../../cn'

/**
 * Select / MultiSelect 的 searchable 分支共享内部模块（08-24-select-search）。
 *
 * 为什么存在：Radix Select / DropdownMenu 均内建 type-ahead（字符键跳转高亮项），
 * 弹层内嵌 input 会与它互相干扰（官方不支持），搜索模式统一换 Radix Popover +
 * 自研可过滤列表。本模块持有两个自研弹层共用的搜索行、过滤函数、键盘导航与
 * 空态行，防止 Select 与 MultiSelect 两套实现视觉/行为漂移。
 * 不是公共基础组件——仅 Select.tsx / MultiSelect.tsx import，不进消费方。
 */

/**
 * 弹层表面类串：Select.tsx（Radix Select Content）/ MultiSelect.tsx
 * （DropdownMenu Content）/ searchable 分支（Popover Content）三处共用的
 * 单一来源，改弹层视觉只改这里（防两套漂移）。
 */
export const POPOVER_SURFACE_CLASS =
  'z-50 rounded-md border border-border bg-surface shadow-lg data-[state=open]:animate-[select-in_120ms_ease-out]'

/** searchable 弹层容器：表面片段 + Popover 触发器最小宽（对齐 Radix Select 的
 * trigger-width 契约）+ overflow-hidden 裁切内层滚动区的圆角 */
export const SEARCH_POPOVER_CLASS = cn(
  POPOVER_SURFACE_CLASS,
  'min-w-[var(--radix-popover-trigger-width)] overflow-hidden',
)

/**
 * searchable listbox 限高（08-25-select-scroll-lock）：桌面 = min(288px, popper 当前
 * side 可用高度)——长列表吃满可用空间且弹层不超出视口；移动（<768px，与
 * data-mobile-sheet 贴底 CSS 同分界）保持固定 288px——sheet 形态被媒体查询
 * !important 钉住后 popper 的 available-height 变量仍按锚点初始位置计算（触发器近
 * 屏底时趋 0），移动端消费该变量会把 sheet 内列表塌到不可用。18rem fallback 保证
 * 变量未定义帧整条声明退回 288px 而不是失效。Radix Select Viewport / DropdownMenu
 * Content 两处原生路径类串同构（变量名各异，见各自组件），改限高语义时三处同步。
 */
export const SEARCH_LISTBOX_CLASS =
  'max-md:max-h-72 md:max-h-[min(18rem,var(--radix-popover-content-available-height,18rem))] overflow-y-auto p-1'

/**
 * option 行视觉：与 Select.tsx SelectItem / MultiSelect.tsx 选项行同串。
 * 自研行没有 Radix 的高亮/选中状态机，渲染时手动挂 data-highlighted /
 * data-state=checked / data-disabled 属性即可复用（类串只认属性存在性）。
 */
export const SELECT_ITEM_CLASS =
  'relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-3 text-sm text-fg data-[highlighted]:bg-surface-hover data-[highlighted]:outline-none data-[state=checked]:font-medium data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'

/** 空态行视觉：对齐 option 行的留白（pl-8 与选项文本对齐），但不可点、无 role */
const NO_MATCH_CLASS =
  'flex cursor-default select-none items-center rounded-sm py-2 pl-8 pr-3 text-sm text-fg-subtle'

/** 参与过滤的项约定：searchText 为过滤文本；null = 非纯文本项（design D3 兜底：
 * 不参与过滤、始终显示，避免过滤把合法选项藏掉） */
export interface SearchableItem {
  searchText: string | null
}

/** 大小写不敏感子串过滤；query 去首尾空白后为空返回全量（清空即恢复） */
export function filterByQuery<T extends SearchableItem>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((it) => it.searchText === null || it.searchText.toLowerCase().includes(q))
}

/**
 * 键盘列表导航：↑/↓ 循环移动高亮、Home/End 跳首尾；Enter / Esc 由调用方按
 * 各自语义处理（单选 = 选中并关闭，多选 = 勾选不关闭）。列表变短时钳制高亮
 * 到合法区间，防止 aria-activedescendant 悬空指向已卸载的行。
 */
export function useListNavigation(count: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, count - 1)))
  }, [count])

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<Element>) => {
      if (count === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIndex((i) => (i + 1) % count)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIndex((i) => (i - 1 + count) % count)
      } else if (e.key === 'Home') {
        e.preventDefault()
        setIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setIndex(count - 1)
      }
    },
    [count],
  )

  /**
   * 高亮行滚进可见区。用 callback ref 而非 useEffect 挂逻辑：弹层内容经
   * Radix portal 提交晚于父组件 effect（component-guidelines「Native listeners
   * on Radix portal content」——ref 为 null 的坑同源）。
   */
  const highlightRef = useCallback((el: HTMLElement | null) => {
    el?.scrollIntoView({ block: 'nearest' })
  }, [])

  return { index, setIndex, onKeyDown, highlightRef }
}

interface SearchRowProps {
  query: string
  onQueryChange: (q: string) => void
  onKeyDown: (e: ReactKeyboardEvent<HTMLInputElement>) => void
  /** input 的 aria-controls（listbox 容器 id）——combobox 语义联动 */
  listboxId: string
  /** 当前高亮 option 的 id（aria-activedescendant）；空列表时省略 */
  activeOptionId?: string
}

/** 弹层顶部搜索行：打开即聚焦（autoFocus），宽度撑满弹层内容区，视觉对齐 Input 语言 */
export function SearchRow({ query, onQueryChange, onKeyDown, listboxId, activeOptionId }: SearchRowProps) {
  return (
    <div className="border-b border-border p-2">
      <input
        type="text"
        autoFocus
        value={query}
        placeholder="搜索"
        aria-label="搜索"
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full rounded-sm border border-border-strong bg-surface px-2 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
      />
    </div>
  )
}

/** 空态行（过滤无匹配 / options 为空）：文案可覆写（MultiSelect 的 emptyLabel 复用），不可点、无 role=option（不干扰 E2E getByRole('option') 契约） */
export function NoMatchRow({ label = '无匹配选项' }: { label?: string }) {
  return <div className={NO_MATCH_CLASS}>{label}</div>
}
