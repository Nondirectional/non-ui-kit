import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '../../icons'
import { buildMonthMatrix, parseDateInput, todayInput, toDateInput } from '../../utils/date'
import { cn } from '../../cn'

interface DatePickerProps {
  /** 受控值：'yyyy-MM-dd' 或 ''（未选） */
  value: string
  onChange: (v: string) => void
  /** 默认「选择日期」 */
  placeholder?: string
  disabled?: boolean
  /** 落在触发器上：label htmlFor 与 E2E id locator 依赖它 */
  id?: string
  /** 只追加布局类（w-* / mt-* 等），不得覆盖视觉类 */
  className?: string
  /** 面板内「清除」按钮（默认 true）；值必填的场景（如日报日期）置 false */
  clearable?: boolean
  /** 可选最大日期 'yyyy-MM-dd'：之后的日期格禁用（工时/日报不允许未来日） */
  max?: string
  /** 无可见 label 场景的触发器可访问名 */
  'aria-label'?: string
}

/** 触发器视觉：与 Input / Select 同款类串（单一来源约定见 component-guidelines） */
export const PICKER_TRIGGER_CLASS =
  'w-full cursor-pointer rounded-md border border-border-strong bg-surface px-3 py-2 text-left text-sm text-fg transition-colors focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

const NAV_BTN_CLASS =
  'rounded-sm p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg'

const PANEL_BTN_CLASS =
  'rounded-sm px-2 py-1 text-xs text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg'

/** 周一起始的表头（getDay 周日=6）；月/周日历视图（schedule）复用同一惯例 */
export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

interface CalendarPanelProps {
  /** 当前选中 'yyyy-MM-dd' 或 '' */
  value: string
  /** 点选某日（回传 'yyyy-MM-dd'）；是否关闭弹层由外层决定 */
  onPick: (v: string) => void
  /** 提供「清除」按钮并回调；不传则不显示 */
  onClear?: () => void
  /** 显示「今天」快捷按钮（默认 true），点击选今天 */
  showToday?: boolean
  /** 弹层打开时的初始展示月；缺省取选中值所在月，无值则当月 */
  initialMonth?: { y: number; m: number }
  /** 可选最大日期 'yyyy-MM-dd'，之后禁选 */
  max?: string
}

function defaultViewMonth(value: string): { y: number; m: number } {
  const parsed = parseDateInput(value)
  if (parsed) return { y: parsed.y, m: parsed.m }
  const now = new Date()
  return { y: now.getFullYear(), m: now.getMonth() + 1 }
}

/**
 * 月历面板本体（周一起始 + 上/下月导航 + 今日描边 + 选中实心 + 底部快捷行）。
 * DatePicker / DateTimePicker 的弹层共用；不自带弹层开关语义。
 */
export function CalendarPanel({
  value,
  onPick,
  onClear,
  showToday = true,
  initialMonth,
  max,
}: CalendarPanelProps) {
  const [view, setView] = useState(() => initialMonth ?? defaultViewMonth(value))
  const weeks = buildMonthMatrix(view.y, view.m)
  const today = todayInput()

  const goPrev = () =>
    setView(view.m === 1 ? { y: view.y - 1, m: 12 } : { y: view.y, m: view.m - 1 })
  const goNext = () =>
    setView(view.m === 12 ? { y: view.y + 1, m: 1 } : { y: view.y, m: view.m + 1 })

  return (
    <div className="w-64">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="font-mono text-sm font-medium text-fg">
          {view.y}年{view.m}月
        </span>
        <div className="flex gap-1">
          <button type="button" aria-label="上个月" onClick={goPrev} className={NAV_BTN_CLASS}>
            <IconChevronLeft />
          </button>
          <button type="button" aria-label="下个月" onClick={goNext} className={NAV_BTN_CLASS}>
            <IconChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="flex h-7 items-center justify-center text-xs text-fg-muted"
            aria-hidden
          >
            {label}
          </span>
        ))}
        {weeks.flat().map((cell) => {
          const iso = toDateInput(cell.y, cell.m, cell.d)
          if (!cell.inMonth) {
            return <span key={iso} aria-hidden className="h-8" />
          }
          const selected = iso === value
          const isToday = iso === today
          const beyondMax = max != null && iso > max
          return (
            <button
              key={iso}
              type="button"
              aria-label={`${cell.y}年${cell.m}月${cell.d}日`}
              aria-pressed={selected}
              disabled={beyondMax}
              onClick={() => onPick(iso)}
              className={cn(
                'flex h-8 w-8 justify-self-center items-center justify-center rounded-sm font-mono text-sm text-fg transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
                !selected && isToday && 'ring-1 ring-accent text-accent',
                selected && 'bg-accent text-accent-fg hover:bg-accent',
              )}
            >
              {cell.d}
            </button>
          )
        })}
      </div>

      {(onClear || showToday) && (
        <div className="mt-2 flex items-center justify-end gap-1 border-t border-border pt-2">
          {onClear && (
            <button type="button" onClick={onClear} className={cn(PANEL_BTN_CLASS, 'mr-auto')}>
              清除
            </button>
          )}
          {showToday && (
            <button
              type="button"
              onClick={() => onPick(today)}
              disabled={max != null && today > max}
              className={cn(
                PANEL_BTN_CLASS,
                'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
              )}
            >
              今天
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 全站日期选择基础组件（08-19-replace-native-ui 批次 C）：自建周一起始月历 +
 * Radix Popover 弹层，替换原生 input[type=date]。触发器为 Input 外观按钮
 * （id 落触发器，label htmlFor 可用），深浅主题全走语义 token。
 * 键盘：弹层 Esc/焦点归还由 radix 处理；日期格为 button，Tab 可达。
 */
export function DatePicker({
  value,
  onChange,
  placeholder = '选择日期',
  disabled,
  id,
  className,
  clearable = true,
  max,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(PICKER_TRIGGER_CLASS, className)}
      >
        <span className="flex items-center justify-between gap-2">
          <span className={value ? 'font-mono' : 'text-fg-subtle'}>{value || placeholder}</span>
          <span className="shrink-0 text-fg-muted">
            <IconCalendar />
          </span>
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-mobile-sheet
          aria-label="选择日期"
          sideOffset={4}
          align="start"
          className="z-50 rounded-md border border-border bg-surface p-3 shadow-lg outline-none data-[state=open]:animate-[select-in_120ms_ease-out]"
        >
          <CalendarPanel
            value={value}
            max={max}
            onPick={(v) => {
              onChange(v)
              setOpen(false) // 选定即收起（DateTimePicker 场景不收起，由其自行组装）
            }}
            onClear={
              clearable
                ? () => {
                    onChange('')
                    setOpen(false)
                  }
                : undefined
            }
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
