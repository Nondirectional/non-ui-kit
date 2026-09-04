import { useEffect, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { IconCalendar } from '../../icons'
import { parseDateTimeInput } from '../../utils/date'
import { CalendarPanel, PICKER_TRIGGER_CLASS } from './DatePicker'
import { cn } from '../../cn'

interface DateTimePickerProps {
  /** 受控值：'yyyy-MM-ddTHH:mm'（与 datetime-local 及后端序列化一致）或 ''（未选） */
  value: string
  onChange: (v: string) => void
  /** 默认「选择日期时间」 */
  placeholder?: string
  disabled?: boolean
  /** 落在触发器上：label htmlFor 与 E2E id locator 依赖它 */
  id?: string
  /** 只追加布局类（w-* / mt-* 等） */
  className?: string
  /** 无可见 label 场景的触发器可访问名 */
  'aria-label'?: string
}

/** 只选了日期（时间行未触碰）时的缺省时段 */
const DEFAULT_TIME = '09:00'

const TIME_FIELD_CLASS =
  'w-12 rounded-sm border border-border-strong bg-surface px-1 py-1 text-center font-mono text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none'

/** 两位数字时段输入：只允许数字，失焦/回车时 clamp 到 [0, max] 并补零提交 */
function TimeField({
  value,
  max,
  placeholder,
  ariaLabel,
  onCommit,
}: {
  /** 受控回显值（'09' 式两位串，无值时传 '' 显示 placeholder） */
  value: string
  max: number
  placeholder: string
  ariaLabel: string
  onCommit: (v: string) => void
}) {
  const [text, setText] = useState(value)
  // 外部 value 变化（选了日期 / 父级重置）时同步回显
  useEffect(() => {
    setText(value)
  }, [value])

  const commit = () => {
    if (text === value) return
    if (text === '') {
      setText(value) // 清空视为放弃编辑，还原
      return
    }
    const clamped = String(Math.min(max, Math.max(0, Math.round(Number(text))))).padStart(2, '0')
    setText(clamped)
    onCommit(clamped)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value.replace(/\D/g, '').slice(0, 2))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault() // 面板在 form 内时避免回车直接提交表单
          commit()
        }
      }}
      className={TIME_FIELD_CLASS}
    />
  )
}

/**
 * 日期时间选择（08-19-replace-native-ui 批次 C）：DatePicker 的月历面板 +
 * 底部「时 : 分」两位数字时段行，替换原生 input[type=datetime-local]。
 * 汇总规则：选日期即 onChange 'yyyy-MM-ddTHH:mm'（时段未触碰时用缺省 09:00，
 * 已有值则保留）；只改时段时已有日期不变。选日期不自动收起弹层（还需校对时间），
 * Esc / 点击面板外关闭。
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = '选择日期时间',
  disabled,
  id,
  className,
  'aria-label': ariaLabel,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  /** 时间行已被用户提交的 'HH:mm'；null = 未触碰（回显 value 的时段或 09:00 占位） */
  const [timeDraft, setTimeDraft] = useState<string | null>(null)

  // 父级清值（弹窗重开/重置）时撤销时段草稿，回到 09:00 占位
  useEffect(() => {
    if (value === '') setTimeDraft(null)
  }, [value])

  const parsed = parseDateTimeInput(value)
  const datePart = parsed?.date ?? ''
  const shownTime = timeDraft ?? parsed?.time ?? DEFAULT_TIME
  const hasTime = parsed != null || timeDraft != null

  const commitTime = (t: string) => {
    setTimeDraft(t)
    if (datePart) onChange(`${datePart}T${t}`) // 尚无日期时先记时段，待选日期后一并汇总
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(PICKER_TRIGGER_CLASS, className)}
      >
        <span className="flex items-center justify-between gap-2">
          <span className={value ? 'font-mono' : 'text-fg-subtle'}>
            {value ? value.replace('T', ' ') : placeholder}
          </span>
          <span className="shrink-0 text-fg-muted">
            <IconCalendar />
          </span>
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-mobile-sheet
          aria-label="选择日期时间"
          sideOffset={4}
          align="start"
          className="z-50 rounded-md border border-border bg-surface p-3 shadow-lg outline-none data-[state=open]:animate-[select-in_120ms_ease-out]"
        >
          <CalendarPanel
            value={datePart}
            onPick={(d) => onChange(`${d}T${shownTime}`)}
          />
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
            <span className="pl-1 text-xs text-fg-muted">时间</span>
            <div className="flex items-center gap-1">
              <TimeField
                ariaLabel="小时"
                placeholder={DEFAULT_TIME.slice(0, 2)}
                value={hasTime ? shownTime.slice(0, 2) : ''}
                max={23}
                onCommit={(h) => commitTime(`${h}:${shownTime.slice(3)}`)}
              />
              <span className="text-sm text-fg-muted" aria-hidden>
                :
              </span>
              <TimeField
                ariaLabel="分钟"
                placeholder={DEFAULT_TIME.slice(3)}
                value={hasTime ? shownTime.slice(3) : ''}
                max={59}
                onCommit={(m) => commitTime(`${shownTime.slice(0, 2)}:${m}`)}
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
