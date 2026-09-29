/// <reference types="vite/client" />
/**
 * @non/ui 统一入口。消费方一律 `import { Button } from '@non/ui'`。
 * select-search.tsx 是 searchable 弹层的内部共享件，不进 barrel。
 *
 * 顶部 triple-slash 引入 vite/client 类型：本包源码使用 import.meta.env.DEV
 * （Select searchable 的非文本 children 开发警告），而消费方 tsc 会把包内
 * .ts 源文件纳入类型检查——从这里把 ImportMeta 类型带进对方程序，消费方
 * 无需自行配置（模板另配有标准 vite-env.d.ts，双保险）。
 */

// 基础组件
export { Button } from './components/ui/Button'
export type { ButtonVariant, ButtonSize } from './components/ui/Button'
export { Input } from './components/ui/Input'
export { Textarea } from './components/ui/Textarea'
export { Select, SelectItem } from './components/ui/Select'
export { MultiSelect } from './components/ui/MultiSelect'
export type { MultiSelectOption } from './components/ui/MultiSelect'
export { AppDialog } from './components/ui/Dialog'
export { DatePicker, CalendarPanel, WEEKDAY_LABELS } from './components/ui/DatePicker'
export { DateTimePicker } from './components/ui/DateTimePicker'
export { Tooltip, TooltipProvider } from './components/ui/Tooltip'
export { Dot } from './components/ui/Dot'
export { StatusDot } from './components/ui/StatusDot'
export type { StatusDotState } from './components/ui/StatusDot'
export { Banner } from './components/ui/Banner'
export type { BannerTone } from './components/ui/Banner'

// 看板组件（0.2.0 起）：数据看板刚需件，API 同样受控优先、语义 token 取色
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/Card'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs'
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/ui/Table'
export type { TableSort } from './components/ui/Table'
export { Badge } from './components/ui/Badge'
export type { BadgeVariant } from './components/ui/Badge'
export { Switch } from './components/ui/Switch'

// 全局 Provider（挂在应用根部）与对应 hook
export { ConfirmProvider, useConfirm } from './components/ui/ConfirmProvider'
export type { ConfirmOptions } from './components/ui/ConfirmProvider'
export { ToastProvider, useToast } from './components/ui/ToastProvider'
export type { ToastApi } from './components/ui/ToastProvider'

// 图标（32 个线性描边图标，stroke 1.4 / currentColor）
export * from './icons'

// 主题
export {
  useTheme,
  setTheme,
  DEFAULT_THEME_STORAGE_KEY,
  type ThemeSetting,
} from './theme/useTheme'

// 日期纯函数工具（本地时区，形状 'yyyy-MM-dd' / 'yyyy-MM-ddTHH:mm'）
export {
  pad2,
  toDateInput,
  daysInMonth,
  parseDateInput,
  todayInput,
  buildMonthMatrix,
  parseDateTimeInput,
  toMinutePrecision,
  addDaysInput,
  startOfWeekInput,
  addMinutes,
  presetRange,
} from './utils/date'
export type { YearMonthDay, MonthCell, DateTimeParts } from './utils/date'

// 类名拼接
export { cn } from './cn'
