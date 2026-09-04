import { useId, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Popover from '@radix-ui/react-popover'
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

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  /** 当前选中的 value 列表（受控） */
  value: string[]
  onValueChange: (values: string[]) => void
  /** 0 选中时触发器文案（placeholder 视觉），默认「请选择」 */
  placeholder?: string
  /** 触发器最多展示的名字数，默认 2 */
  maxPreview?: number
  /** 「等 N」的单位，默认「项」（参与人场景传「人」） */
  overflowUnit?: string
  /** options 为空时弹层内文案（disabled 项样式，不可点），默认「暂无选项」 */
  emptyLabel?: string
  disabled?: boolean
  /** 落在触发器 button 上：label htmlFor 与 E2E id locator 依赖它 */
  id?: string
  /** 无可见 label 场景的触发器可访问名 */
  'aria-label'?: string
  /** 只追加布局类（mt-* 等）；宽度固定 w-full，不得用同组 w-* 覆盖（cn 无 tailwind-merge） */
  className?: string
  /** 弹层内搜索过滤（动态长列表场景开启）；默认 false 走 Radix DropdownMenu 原路径，渲染输出不变 */
  searchable?: boolean
}

/** 触发器视觉：与 Select 同形（Input 外观 + 右端 chevron，flex 两端布局保证文本与图标同行）；
 * 0 选中时 data-placeholder 切 placeholder 视觉（fg-subtle） */
const TRIGGER_CLASS =
  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-3 py-2 text-left text-sm text-fg transition-colors focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-fg-subtle'

/** 勾选/取消后的新 value 数组：取消从原位移除、追加保持 options 内的选中顺序（两个弹层分支共用） */
function toggleValue(value: string[], v: string, checked: boolean): string[] {
  const rest = value.filter((x) => x !== v)
  return checked ? [...rest, v] : rest
}

/**
 * 通用多选下拉（Radix DropdownMenu 封装，08-20-schedule-participant-multiselect）：
 * 触发器 = Input 外观 + 右端 chevron（与 Select 同形，宽度固定 w-full 供表单使用）；
 * 弹层 = Portal 挂 body、限高滚动（max-h-72）、选中项 accent 勾标、高亮 bg-surface-hover；
 * 勾选不关闭菜单（多选需要连点，radix 默认选中即关，需 preventDefault）；
 * 点击外部 / ESC 关闭、键盘导航勾选用 Radix 内建，不手写。深浅主题全走语义 token。
 * 08-24-select-search：`searchable` 开启时内部切换 Popover + 自研可过滤列表
 * （DropdownMenu 弹层不支持内嵌输入框）；默认 false 走原路径，渲染输出零变化。
 */
export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = '请选择',
  maxPreview = 2,
  overflowUnit = '项',
  emptyLabel = '暂无选项',
  disabled,
  id,
  'aria-label': ariaLabel,
  className,
  searchable = false,
}: MultiSelectProps) {
  const valueSet = useMemo(() => new Set(value), [value])
  // preview 按 options 顺序取选中项（与 value 的写入顺序无关）——两个弹层分支共用
  const selected = useMemo(() => options.filter((o) => valueSet.has(o.value)), [options, valueSet])
  const isEmpty = selected.length === 0
  const preview =
    selected
      .slice(0, maxPreview)
      .map((o) => o.label)
      .join('、') + (selected.length > maxPreview ? ` 等 ${selected.length} ${overflowUnit}` : '')

  if (searchable) {
    return (
      <SearchableMultiSelect
        options={options}
        value={value}
        valueSet={valueSet}
        onValueChange={onValueChange}
        emptyLabel={emptyLabel}
        disabled={disabled}
        id={id}
        ariaLabel={ariaLabel}
        className={className}
        triggerText={isEmpty ? placeholder : preview}
        showPlaceholder={isEmpty}
      />
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={id}
          aria-label={ariaLabel}
          disabled={disabled}
          data-placeholder={isEmpty ? '' : undefined}
          className={cn(TRIGGER_CLASS, className)}
        >
          <span className="truncate">{isEmpty ? placeholder : preview}</span>
          <IconChevronDown className="shrink-0 text-fg-muted" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          data-mobile-sheet
          sideOffset={4}
          className={cn(
            POPOVER_SURFACE_CLASS,
            // 限高：桌面 min(288px, 当前 side 可用高度)（08-25-select-scroll-lock，
            // 语义与 searchable 分支 SEARCH_LISTBOX_CLASS 同构，变量名随 DropdownMenu）
            'max-md:max-h-72 md:max-h-[min(18rem,var(--radix-dropdown-menu-content-available-height,18rem))] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto p-1',
          )}
        >
          {options.length === 0 ? (
            <DropdownMenu.Item disabled className={SELECT_ITEM_CLASS}>
              {emptyLabel}
            </DropdownMenu.Item>
          ) : (
            options.map((o) => (
              <DropdownMenu.CheckboxItem
                key={o.value}
                checked={valueSet.has(o.value)}
                // 多选：勾选项后不关闭菜单
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(checked) => onValueChange(toggleValue(value, o.value, checked))}
                className={SELECT_ITEM_CLASS}
              >
                <span className="absolute left-2.5 flex size-4 items-center justify-center text-accent">
                  <DropdownMenu.ItemIndicator>
                    <IconCheck />
                  </DropdownMenu.ItemIndicator>
                </span>
                {o.label}
              </DropdownMenu.CheckboxItem>
            ))
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

interface SearchableMultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  valueSet: Set<string>
  onValueChange: (values: string[]) => void
  emptyLabel: string
  disabled?: boolean
  id?: string
  ariaLabel?: string
  className?: string
  /** 预计算的触发器文案（preview 逻辑在外层 MultiSelect，两分支共用一份） */
  triggerText: string
  showPlaceholder: boolean
}

/**
 * searchable 分支：Radix Popover + 搜索行 + 自研多选 listbox（role=option +
 * aria-selected，aria-multiselectable）。勾选 toggle 不关闭菜单（连选主用途）；
 * 勾选不清空搜索词（连续筛同类），关闭弹层才清空（design D4）。
 * options 为空显示 emptyLabel（现有语义），过滤无匹配显示「无匹配选项」。
 */
function SearchableMultiSelect({
  options,
  value,
  valueSet,
  onValueChange,
  emptyLabel,
  disabled,
  id,
  ariaLabel,
  className,
  triggerText,
  showPlaceholder,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => filterByQuery(options.map((o) => ({ ...o, searchText: o.label })), query),
    [options, query],
  )
  const nav = useListNavigation(filtered.length)
  const listboxId = useId()

  const toggle = (v: string) => onValueChange(toggleValue(value, v, !valueSet.has(v)))

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) nav.setIndex(0)
    else setQuery('') // 关闭弹层清空搜索词；勾选不清（连续筛同类是主用途）
  }

  const handleQueryChange = (q: string) => {
    setQuery(q)
    nav.setIndex(0) // 输入变化即过滤结果变化，高亮重回首项
  }

  const handleInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Space 一并勾选：子串匹配无分词语义，含空格的 query 本就无命中，
      // 让 Space 触发勾选不损失实际过滤能力
      e.preventDefault()
      const item = filtered[nav.index]
      if (item) toggle(item.value) // 多选：勾选高亮项但不关闭菜单
      return
    }
    nav.onKeyDown(e) // ↑/↓/Home/End；Esc 关闭由 Radix Popover 统一处理
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={id}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          disabled={disabled}
          data-placeholder={showPlaceholder ? '' : undefined}
          className={cn(TRIGGER_CLASS, className)}
        >
          <span className="truncate">{triggerText}</span>
          <IconChevronDown className="shrink-0 text-fg-muted" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        {/* 页面滚动锁（08-25-select-scroll-lock）：Popover 非 modal 无内建锁，滚轮落在
         * 弹层外时页面滚动会把 popper 顶出视口。RemoveScroll 与 DropdownMenu modal 的
         * 内建机制同源，无焦点陷阱/外部点击消费副作用；随 Portal 挂载即锁、卸载即解。 */}
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
            <div
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              className={SEARCH_LISTBOX_CLASS}
            >
              {options.length === 0 ? (
                <NoMatchRow label={emptyLabel} />
              ) : filtered.length === 0 ? (
                <NoMatchRow />
              ) : (
                filtered.map((o, idx) => {
                  const checked = valueSet.has(o.value)
                  const isHighlighted = idx === nav.index
                  return (
                    <div
                      key={o.value}
                      id={`${listboxId}-opt-${idx}`}
                      role="option"
                      aria-selected={checked}
                      data-highlighted={isHighlighted ? '' : undefined}
                      data-state={checked ? 'checked' : 'unchecked'}
                      ref={isHighlighted ? nav.highlightRef : undefined}
                      onClick={() => toggle(o.value)} // 勾选不关闭菜单，多选连点
                      className={SELECT_ITEM_CLASS}
                    >
                      <span className="absolute left-2.5 flex size-4 items-center justify-center text-accent">
                        {checked && <IconCheck />}
                      </span>
                      {o.label}
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
