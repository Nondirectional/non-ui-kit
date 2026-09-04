import { Children, Fragment, isValidElement, useId, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import * as SelectPrimitive from '@radix-ui/react-select'
import { RemoveScroll } from 'react-remove-scroll'
import { IconCheck, IconChevronDown } from '../../icons'
import { cn } from '../../cn'
import {
  filterByQuery,
  NoMatchRow,
  POPOVER_SURFACE_CLASS,
  SEARCH_LISTBOX_CLASS,
  SEARCH_POPOVER_CLASS,
  SearchRow,
  SELECT_ITEM_CLASS,
  useListNavigation,
} from './select-search'

interface SelectProps {
  /** 受控值；'' / undefined = 未选（显示 placeholder）。Radix 不接受空串，内部映射为 undefined */
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** 宽度：full = 撑满容器（表单默认）；auto = 内容宽（行内筛选）。不要用 className 的 w-* 覆盖宽度（同组类顺序不可控） */
  width?: 'full' | 'auto'
  /** 落在触发器 button 上：label htmlFor 与 E2E id locator 依赖它 */
  id?: string
  /** 无可见 label 场景的触发器可访问名（如行内筛选） */
  'aria-label'?: string
  /** 只追加布局类（w-* / mt-* 等），不得覆盖视觉类 */
  className?: string
  /** SelectItem 列表 */
  children: ReactNode
  /** 弹层内搜索过滤（动态长列表场景开启）；默认 false 走 Radix Select 原路径，渲染输出不变 */
  searchable?: boolean
}

/** 宽度变体查表（互斥完整串，不做同类叠加——cn 无 tailwind-merge） */
const WIDTH_CLASS = {
  full: 'w-full',
  auto: 'w-auto',
} as const

/** 触发器视觉：沿用原原生 select 的类串（同 Input），cursor-pointer + 焦点 accent 边；
 * flex 两端布局保证文本与 chevron 永远同行（inline 布局会把图标挤到第二行） */
const TRIGGER_CLASS =
  'flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-3 py-2 text-left text-sm text-fg transition-colors focus:border-accent focus:outline-none disabled:opacity-50 data-[placeholder]:text-fg-subtle'

/**
 * 全站唯一下拉基础组件（Radix Select 封装，08-19-replace-native-ui 批次 B）：
 * 触发器 = Input 外观 + 右端 chevron；弹层 = Portal 挂 body、限高滚动、
 * option 高亮 bg-surface-hover、选中项 accent 勾标。深浅主题全走语义 token。
 * 08-24-select-search：`searchable` 开启时内部切换 Popover + 自研可过滤列表
 * （Radix Select 弹层不支持内嵌输入框），触发器与键盘/受控契约同形；
 * 默认 false 走下方 Radix 路径，渲染输出零变化。
 */
export function Select({
  value,
  onValueChange,
  placeholder,
  disabled,
  width = 'full',
  id,
  'aria-label': ariaLabel,
  className,
  children,
  searchable = false,
}: SelectProps) {
  if (searchable) {
    return (
      <SearchableSelect
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        width={width}
        id={id}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </SearchableSelect>
    )
  }
  return (
    <SelectPrimitive.Root
      value={value === '' || value === undefined ? undefined : value}
      /* Radix 的 BubbleInput（表单自动填充用隐藏原生 select）在值从非空切到空时
       * 会派发合成 change 回灌 onValueChange('')；本组件无空串选项，'' 一律是
       * 回灌噪音，吞掉以免消费方 Number('') 得 0（08-21-project-owners 实测） */
      onValueChange={(v) => {
        if (v !== '') onValueChange?.(v)
      }}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(WIDTH_CLASS[width], TRIGGER_CLASS, className)}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="text-fg-muted">
          <IconChevronDown />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          data-mobile-sheet
          className={cn(
            POPOVER_SURFACE_CLASS,
            'min-w-[var(--radix-select-trigger-width)] overflow-hidden',
          )}
        >
          {/* 限高：桌面 min(288px, 当前 side 可用高度)（08-25-select-scroll-lock，语义与
           * searchable 分支 SEARCH_LISTBOX_CLASS 同构，变量名随 Radix Select） */}
          <SelectPrimitive.Viewport className="max-md:max-h-72 md:max-h-[min(18rem,var(--radix-select-content-available-height,18rem))] overflow-y-auto p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

/** searchable 分支从 SelectItem children 提取的选项数据（design D3） */
interface SearchableItemData {
  value: string
  disabled: boolean
  /** 触发器/选项行的显示内容（SelectItem children 原样透传） */
  label: ReactNode
  /** 参与过滤的纯文本；children 非 string 时为 null（不参与过滤、始终显示） */
  searchText: string | null
  /** SelectItem 的布局追加类，透传到自研行 */
  className?: string
}

/**
 * 用 Children.forEach 读取每个 SelectItem element 的 props.{value, disabled,
 * children, className}。约束：searchable 模式要求 SelectItem children 是单一
 * 字符串/模板字符串（JSX 相邻表达式会让 children 变数组，从而丢失过滤文本）；
 * 非纯文本项兜底为不过滤始终显示并 dev warn，不 throw 以免破坏渲染。
 * 空 value（Radix 本就不允许）与非 element child 直接忽略。
 * 注意 Children.forEach/toArray 均不展开 Fragment（React 19 实测）——消费方
 * 常用模块级 <>…</> 常量传选项，必须手动递归下钻 Fragment 才能拿到 SelectItem。
 */
function extractItemData(children: ReactNode): SearchableItemData[] {
  const items: SearchableItemData[] = []
  const visit = (node: ReactNode): void => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return
      if (child.type === Fragment) {
        visit((child.props as { children?: ReactNode }).children)
        return
      }
      const p = child.props as {
        value?: unknown
        disabled?: unknown
        children?: unknown
        className?: string
      }
      if (typeof p.value !== 'string' || p.value === '') return
      const label = p.children as ReactNode
      const text = typeof label === 'string' ? label : null
      if (text === null && import.meta.env.DEV) {
        console.warn(
          '[Select searchable] SelectItem 的 children 必须是纯文本字符串（模板字符串），' +
            '非文本项不参与过滤、始终显示：',
          p.value,
        )
      }
      items.push({
        value: p.value,
        disabled: p.disabled === true,
        label,
        searchText: text,
        className: p.className,
      })
    })
  }
  visit(children)
  return items
}

/**
 * searchable 分支：Radix Popover + 弹层顶部搜索行 + 自研 listbox。
 * 触发器与非 searchable 路径完全同形（TRIGGER_CLASS / id / aria / width 变体 /
 * data-placeholder / chevron），显示文本改为 items 的 value→label 查表；
 * option 行 role=option + aria-selected 保持 E2E getByRole('option') 契约。
 * '' 吞掉语义与 Radix 路径一致（自研路径 option 值全部来自 SelectItem，
 * 空串属违规用法，防御性吞掉不回调——08-21-project-owners 契约不变）。
 */
function SearchableSelect({
  value,
  onValueChange,
  placeholder,
  disabled,
  width = 'full',
  id,
  'aria-label': ariaLabel,
  className,
  children,
}: SelectProps) {
  const items = useMemo(() => extractItemData(children), [children])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => filterByQuery(items, query), [items, query])
  const nav = useListNavigation(filtered.length)
  const listboxId = useId()

  const selected =
    value === '' || value === undefined ? undefined : items.find((i) => i.value === value)
  const showPlaceholder = selected === undefined

  const commit = (v: string) => {
    if (v === '') return // '' 一律是回灌噪音，吞掉（契约同 Radix 路径）
    onValueChange?.(v)
    setOpen(false) // 单选：点选/回车即收起
    // 程序性关闭不经过 onOpenChange，必须手动清搜索词（design D4：
    // 选中关闭后下次打开为干净的全量起点；Esc/点击外部关闭走 handleOpenChange）
    setQuery('')
  }

  const handleQueryChange = (q: string) => {
    setQuery(q)
    nav.setIndex(0) // 输入变化即过滤结果变化，高亮重回首项
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) nav.setIndex(0)
    else setQuery('') // design D4：关闭即清空搜索词，下次打开为干净的全量起点
  }

  const handleInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // input 经 portal 挂 body 无 form 语义，防御性阻断隐式提交
      const item = filtered[nav.index]
      if (item && !item.disabled) commit(item.value)
      return
    }
    nav.onKeyDown(e) // ↑/↓/Home/End；Esc 关闭由 Radix Popover 统一处理
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        disabled={disabled}
        data-placeholder={showPlaceholder ? '' : undefined}
        className={cn(WIDTH_CLASS[width], TRIGGER_CLASS, className)}
      >
        <span>{showPlaceholder ? (placeholder ?? '') : selected.label}</span>
        <span className="text-fg-muted">
          <IconChevronDown />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        {/* 页面滚动锁（08-25-select-scroll-lock）：Popover 非 modal 无内建锁，滚轮落在
         * 弹层外时页面滚动会把 popper 顶出视口。RemoveScroll 与 Radix Select/DropdownMenu
         * modal 的内建机制同源，无焦点陷阱/外部点击消费副作用；随 Portal 挂载即锁、
         * 卸载即解，无需 enabled 开关。 */}
        <RemoveScroll allowPinchZoom>
          <Popover.Content
            data-mobile-sheet
            sideOffset={4}
            align="start"
            className={SEARCH_POPOVER_CLASS}
          >
            <SearchRow
              query={query}
              onQueryChange={handleQueryChange}
              onKeyDown={handleInputKeyDown}
              listboxId={listboxId}
              activeOptionId={filtered.length > 0 ? `${listboxId}-opt-${nav.index}` : undefined}
            />
            <div id={listboxId} role="listbox" className={SEARCH_LISTBOX_CLASS}>
              {filtered.length === 0 ? (
                <NoMatchRow />
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = item.value === selected?.value
                  const isHighlighted = idx === nav.index
                  return (
                    <div
                      key={item.value}
                      id={`${listboxId}-opt-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={item.disabled || undefined}
                      data-highlighted={isHighlighted ? '' : undefined}
                      data-state={isSelected ? 'checked' : 'unchecked'}
                      data-disabled={item.disabled ? '' : undefined}
                      ref={isHighlighted ? nav.highlightRef : undefined}
                      onClick={item.disabled ? undefined : () => commit(item.value)}
                      className={cn(SELECT_ITEM_CLASS, item.className)}
                    >
                      <span className="absolute left-2.5 flex size-4 items-center justify-center text-accent">
                        {isSelected && <IconCheck />}
                      </span>
                      {item.label}
                    </div>
                  )
                })
              )}
            </div>
          </Popover.Content>
        </RemoveScroll>
      </Popover.Portal>
    </Popover.Root>
  )
}

interface SelectItemProps {
  value: string
  disabled?: boolean
  children: ReactNode
  /** 只追加布局类 */
  className?: string
}

/** 选项：键盘/指针高亮 bg-surface-hover，选中项 accent 勾标 + medium 字重 */
export function SelectItem({ value, disabled, children, className }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(SELECT_ITEM_CLASS, className)}
    >
      <span className="absolute left-2.5 flex size-4 items-center justify-center text-accent">
        <SelectPrimitive.ItemIndicator>
          <IconCheck />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
