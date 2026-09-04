/*
 * 纯日期字符串工具（08-19-replace-native-ui 批次 C）：DatePicker / DateTimePicker
 * 的月历与解析共用。全部按本地时间纯字符串处理，不引入日期库。
 * 约定：月份一律 1 基（1~12），序列化形状 'yyyy-MM-dd' / 'yyyy-MM-ddTHH:mm'
 * （与后端及原 input[type=date] 的 value 形状一致）。
 */

export interface YearMonthDay {
  y: number
  /** 1 基月份（1~12） */
  m: number
  d: number
}

/** 两位补零（4 位年份由模板串保证） */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** y / m（1 基）/ d → 'yyyy-MM-dd' */
export function toDateInput(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, '0')}-${pad2(m)}-${pad2(d)}`
}

/** 某月天数；m 为 1 基月份，含闰年规则 */
export function daysInMonth(y: number, m: number): number {
  if (m === 2) {
    const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
    return leap ? 29 : 28
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
}

/**
 * 严格解析 'yyyy-MM-dd'：形状必须为 4-2-2 位数字，且月 1~12、
 * 日 1~当月真实天数（'2026-02-30'、'2025-02-29'、'2026-8-19'、'abc'、'' 均 null）。
 */
export function parseDateInput(str: string): YearMonthDay | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str)
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (m < 1 || m > 12) return null
  if (d < 1 || d > daysInMonth(y, m)) return null
  return { y, m, d }
}

/** 本地时区今天的 'yyyy-MM-dd'（不受 UTC 影响，区别于 toISOString） */
export function todayInput(): string {
  const now = new Date()
  return toDateInput(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export interface MonthCell extends YearMonthDay {
  /** false = 前后月补位格（面板渲染为空位、不可选） */
  inMonth: boolean
}

/**
 * 周一起始的月历矩阵：返回 5~6 行、每行 7 格。补位格带前后月的真实
 * y/m/d（inMonth=false），由渲染层决定是否显示（本项目选择渲染空位）。
 * 月首格列号 = (new Date(y, m-1, 1).getDay() + 6) % 7（周一=0）。
 */
export function buildMonthMatrix(y: number, m: number): MonthCell[][] {
  const firstCol = (new Date(y, m - 1, 1).getDay() + 6) % 7
  const dim = daysInMonth(y, m)
  const total = firstCol + dim
  const rows: MonthCell[][] = []
  for (let i = 0; i < total; i += 7) {
    const week: MonthCell[] = []
    for (let col = 0; col < 7; col++) {
      const dayOffset = i + col - firstCol // 相对本月 1 日的偏移，负数/超界为前后月
      const date = new Date(y, m - 1, 1 + dayOffset)
      week.push({
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        inMonth: dayOffset >= 0 && dayOffset < dim,
      })
    }
    rows.push(week)
  }
  return rows
}

export interface DateTimeParts {
  /** 'yyyy-MM-dd' */
  date: string
  /** 'HH:mm' */
  time: string
}

/**
 * 严格解析 'yyyy-MM-ddTHH:mm'（datetime-local 的 value 形状）：
 * 日期部分走 parseDateInput，时 0~23、分 0~59；任何不合法返回 null。
 */
export function parseDateTimeInput(str: string): DateTimeParts | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(str)
  if (!match) return null
  if (parseDateInput(match[1]) == null) return null
  const h = Number(match[2])
  const min = Number(match[3])
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return { date: match[1], time: `${match[2]}:${match[3]}` }
}

/*
 * 以下为 08-20-personal-schedule（日程页）新增：周导航与窗口/分钟运算。
 * 入参宽松：'yyyy-MM-dd' 或 'yyyy-MM-ddTHH:mm[:ss]' 均可（只取前 10 位日期部分），
 * 非法输入原样返回，调用方（页面/组件）不需要额外防御。
 */

/** 'yyyy-MM-ddTHH:mm[:ss]' → 'yyyy-MM-ddTHH:mm'（后端 LocalDateTime 序列化带秒，前端统一到分钟精度） */
export function toMinutePrecision(str: string): string {
  return str.slice(0, 16)
}

/** 日期加 N 天（负数回退；月/年边界自动进位）；入参也接受带时刻的形状 */
export function addDaysInput(date: string, days: number): string {
  const parsed = parseDateInput(date.slice(0, 10))
  if (!parsed) return date
  const d = new Date(parsed.y, parsed.m - 1, parsed.d + days)
  return toDateInput(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

/** 某日所在周的周一 'yyyy-MM-dd'（周一起始，与月历矩阵/周视图列序一致） */
export function startOfWeekInput(date: string): string {
  const parsed = parseDateInput(date.slice(0, 10))
  if (!parsed) return date
  const dow = (new Date(parsed.y, parsed.m - 1, parsed.d).getDay() + 6) % 7 // 周一=0
  return addDaysInput(toDateInput(parsed.y, parsed.m, parsed.d), -dow)
}

/** 'yyyy-MM-ddTHH:mm' 加 N 分钟（跨天/跨月自动进位；负数回退） */
export function addMinutes(str: string, minutes: number): string {
  const parsed = parseDateTimeInput(str)
  if (!parsed) return str
  const date = parseDateInput(parsed.date)!
  const [h, m] = parsed.time.split(':').map(Number)
  const d = new Date(date.y, date.m - 1, date.d, h, m + minutes)
  return `${toDateInput(d.getFullYear(), d.getMonth() + 1, d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/**
 * 近 N 天筛选区间（含今天共 N 天）：from = today-(N-1)d、to = today。
 * 历史筛选时间快捷预设共用（#027 交互契约；PipelinePage 内联同形实现，未抽共用件）。
 */
export function presetRange(days: number): { from: string; to: string } {
  const to = todayInput()
  return { from: addDaysInput(to, -(days - 1)), to }
}
