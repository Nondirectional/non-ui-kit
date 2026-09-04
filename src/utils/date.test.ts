import { describe, expect, it } from 'vitest'
import {
  addDaysInput,
  addMinutes,
  buildMonthMatrix,
  daysInMonth,
  parseDateInput,
  parseDateTimeInput,
  presetRange,
  startOfWeekInput,
  toDateInput,
  todayInput,
  toMinutePrecision,
} from './date'

describe('日期工具', () => {
  describe('toDateInput', () => {
    it('单数月日补零为两位', () => {
      expect(toDateInput(2026, 8, 9)).toBe('2026-08-09')
    })

    it('边界：年初与年末', () => {
      expect(toDateInput(2026, 1, 1)).toBe('2026-01-01')
      expect(toDateInput(2026, 12, 31)).toBe('2026-12-31')
    })
  })

  describe('daysInMonth', () => {
    it('平年二月 28 天、闰年二月 29 天', () => {
      expect(daysInMonth(2025, 2)).toBe(28)
      expect(daysInMonth(2024, 2)).toBe(29)
      expect(daysInMonth(2000, 2)).toBe(29) // 整百年需被 400 整除
      expect(daysInMonth(1900, 2)).toBe(28) // 被 100 整除但不被 400 整除
    })

    it('大小月天数', () => {
      expect(daysInMonth(2026, 1)).toBe(31)
      expect(daysInMonth(2026, 4)).toBe(30)
      expect(daysInMonth(2026, 7)).toBe(31)
    })
  })

  describe('parseDateInput', () => {
    it('正常解析为 1 基月份', () => {
      expect(parseDateInput('2026-08-19')).toEqual({ y: 2026, m: 8, d: 19 })
      expect(parseDateInput('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 })
    })

    it('非法日期返回 null：日超当月天数', () => {
      expect(parseDateInput('2026-02-30')).toBeNull()
      expect(parseDateInput('2025-02-29')).toBeNull() // 平年
      expect(parseDateInput('2026-04-31')).toBeNull()
    })

    it('非法形状与范围返回 null', () => {
      expect(parseDateInput('abc')).toBeNull()
      expect(parseDateInput('')).toBeNull()
      expect(parseDateInput('2026-8-19')).toBeNull() // 未补零
      expect(parseDateInput('2026-13-01')).toBeNull() // 月超界
      expect(parseDateInput('2026-00-10')).toBeNull()
      expect(parseDateInput('2026-08-32')).toBeNull()
      expect(parseDateInput('2026-08-00')).toBeNull()
      expect(parseDateInput('2026-08-19T00:00')).toBeNull() // 带时间不是纯日期
    })
  })

  describe('todayInput', () => {
    it('返回本地今天的 yyyy-MM-dd 形状', () => {
      expect(todayInput()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const now = new Date()
      expect(todayInput()).toBe(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
          now.getDate(),
        ).padStart(2, '0')}`,
      )
    })
  })

  describe('buildMonthMatrix', () => {
    it('2026-08：8 月 1 日（周六）落在首行第 6 列，补位为 7 月末', () => {
      const weeks = buildMonthMatrix(2026, 8)
      expect(weeks).toHaveLength(6) // 偏移 5 + 31 天 = 36 格 → 6 行
      expect(weeks[0][0]).toEqual({ y: 2026, m: 7, d: 27, inMonth: false }) // 周一
      expect(weeks[0][5]).toEqual({ y: 2026, m: 8, d: 1, inMonth: true }) // 周六
      expect(weeks[0][6]).toEqual({ y: 2026, m: 8, d: 2, inMonth: true }) // 周日
    })

    it('行数 5~6、每行 7 格、本月格日期连续且周日收尾', () => {
      for (const [y, m] of [[2026, 1], [2026, 2], [2024, 2], [2026, 12]] as const) {
        const weeks = buildMonthMatrix(y, m)
        expect(weeks.length).toBeGreaterThanOrEqual(5)
        expect(weeks.length).toBeLessThanOrEqual(6)
        const inMonth = weeks.flat().filter((c) => c.inMonth)
        expect(inMonth).toHaveLength(daysInMonth(y, m))
        inMonth.forEach((c, i) => {
          expect(c.d).toBe(i + 1)
          expect(c.m).toBe(m)
        })
        weeks.forEach((w) => expect(w).toHaveLength(7))
      }
    })

    it('跨年补位：2026-01 首行补位带 2025-12 末尾', () => {
      const weeks = buildMonthMatrix(2026, 1)
      const leading = weeks[0].filter((c) => !c.inMonth)
      expect(leading.length).toBeGreaterThan(0)
      leading.forEach((c) => {
        expect(c.y).toBe(2025)
        expect(c.m).toBe(12)
      })
    })
  })

  describe('parseDateTimeInput', () => {
    it('正常拆解为日期与 HH:mm', () => {
      expect(parseDateTimeInput('2026-08-19T14:30')).toEqual({
        date: '2026-08-19',
        time: '14:30',
      })
      expect(parseDateTimeInput('2026-01-01T00:00')).toEqual({ date: '2026-01-01', time: '00:00' })
      expect(parseDateTimeInput('2026-12-31T23:59')).toEqual({ date: '2026-12-31', time: '23:59' })
    })

    it('非法输入返回 null', () => {
      expect(parseDateTimeInput('')).toBeNull()
      expect(parseDateTimeInput('2026-08-19')).toBeNull() // 缺时间
      expect(parseDateTimeInput('2026-08-19T24:00')).toBeNull() // 时超界
      expect(parseDateTimeInput('2026-08-19T14:60')).toBeNull() // 分超界
      expect(parseDateTimeInput('2026-02-30T10:00')).toBeNull() // 日期部分非法
      expect(parseDateTimeInput('abcT10:00')).toBeNull()
    })
  })

  // 08-20-personal-schedule 新增导出（日程页周导航与分钟运算）
  describe('toMinutePrecision', () => {
    it('带秒的后端序列化截断到分钟', () => {
      expect(toMinutePrecision('2026-08-20T10:00:00')).toBe('2026-08-20T10:00')
    })

    it('已是分钟精度则原样返回', () => {
      expect(toMinutePrecision('2026-08-20T10:30')).toBe('2026-08-20T10:30')
    })
  })

  describe('addDaysInput', () => {
    it('月末进位到下月', () => {
      expect(addDaysInput('2026-08-31', 1)).toBe('2026-09-01')
      expect(addDaysInput('2026-09-01', -1)).toBe('2026-08-31')
    })

    it('闰年 2 月边界', () => {
      expect(addDaysInput('2028-02-28', 1)).toBe('2028-02-29')
      expect(addDaysInput('2026-02-28', 1)).toBe('2026-03-01')
    })

    it('跨年', () => {
      expect(addDaysInput('2026-12-31', 1)).toBe('2027-01-01')
    })

    it('接受带时刻的形状（只移动日期部分）', () => {
      expect(addDaysInput('2026-08-20T23:00', 1)).toBe('2026-08-21')
    })

    it('非法输入原样返回', () => {
      expect(addDaysInput('abc', 1)).toBe('abc')
      expect(addDaysInput('', 3)).toBe('')
    })
  })

  describe('startOfWeekInput', () => {
    it('周四回退到本周周一', () => {
      expect(startOfWeekInput('2026-08-20')).toBe('2026-08-17')
    })

    it('周一当天即本周起始', () => {
      expect(startOfWeekInput('2026-08-17')).toBe('2026-08-17')
    })

    it('周日归属上一周（周一起始约定）', () => {
      expect(startOfWeekInput('2026-08-23')).toBe('2026-08-17')
    })

    it('接受带时刻的形状', () => {
      expect(startOfWeekInput('2026-08-20T15:30')).toBe('2026-08-17')
    })

    it('非法输入原样返回', () => {
      expect(startOfWeekInput('2026-8-20')).toBe('2026-8-20')
    })
  })

  describe('addMinutes', () => {
    it('小时内累加并补零', () => {
      expect(addMinutes('2026-08-20T09:30', 15)).toBe('2026-08-20T09:45')
    })

    it('跨天进位', () => {
      expect(addMinutes('2026-08-20T23:30', 60)).toBe('2026-08-21T00:30')
    })

    it('跨月进位', () => {
      expect(addMinutes('2026-08-31T23:00', 120)).toBe('2026-09-01T01:00')
    })

    it('负数回退', () => {
      expect(addMinutes('2026-08-20T00:15', -30)).toBe('2026-08-19T23:45')
    })

    it('非法输入原样返回', () => {
      expect(addMinutes('2026-08-20', 10)).toBe('2026-08-20')
    })
  })

  // 08-26-audit-log-list-ux：时间快捷预设区间（#027 交互契约的纯函数化）
  describe('presetRange', () => {
    it('近 N 天区间含今天：to=今天，from=今天-(N-1) 天', () => {
      const today = todayInput()
      expect(presetRange(1)).toEqual({ from: today, to: today })
      expect(presetRange(7)).toEqual({ from: addDaysInput(today, -6), to: today })
      expect(presetRange(30)).toEqual({ from: addDaysInput(today, -29), to: today })
    })

    it('from/to 形状为 yyyy-MM-dd（可被 parseDateInput 严格解析）', () => {
      const { from, to } = presetRange(30)
      expect(parseDateInput(from)).not.toBeNull()
      expect(parseDateInput(to)).not.toBeNull()
    })
  })
})
