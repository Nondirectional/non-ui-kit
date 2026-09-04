import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DatePicker } from './DatePicker'
import { todayInput } from '../../utils/date'

/** 打开弹层：click 触发器（jsdom 无 pointerType，radix 走非 mouse 的 click 打开分支） */
function openPanel(triggerName: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name: triggerName }))
  return screen.getByRole('dialog', { name: '选择日期' })
}

describe('DatePicker 封装', () => {
  it('回显：value 显示在触发器，空值显示 placeholder', () => {
    const { rerender } = render(<DatePicker value="2026-08-19" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /2026-08-19/ })).toHaveTextContent('2026-08-19')
    rerender(<DatePicker value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '选择日期' })).toHaveTextContent('选择日期')
  })

  it('打开弹层点选日期，回调 yyyy-MM-dd 并收起', () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-08-19" onChange={onChange} />)
    const panel = openPanel(/2026-08-19/)
    // 初始展示月 = 选中值所在月（2026年8月，8 月 1 日周六落在首行第 6 列）
    expect(screen.getByText('2026年8月')).toBeInTheDocument()
    expect(panel).toHaveTextContent('19')
    fireEvent.click(screen.getByRole('button', { name: '2026年8月20日' }))
    expect(onChange).toHaveBeenCalledWith('2026-08-20')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('翻月：上个月按钮切换表头，可选中上月日期', () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-08-19" onChange={onChange} />)
    openPanel(/2026-08-19/)
    fireEvent.click(screen.getByRole('button', { name: '上个月' }))
    expect(screen.getByText('2026年7月')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '2026年7月15日' }))
    expect(onChange).toHaveBeenCalledWith('2026-07-15')
  })

  it('下个月按钮跨年翻到下一年 1 月', () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-12-15" onChange={onChange} />)
    openPanel(/2026-12-15/)
    fireEvent.click(screen.getByRole('button', { name: '下个月' }))
    expect(screen.getByText('2027年1月')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '2027年1月8日' }))
    expect(onChange).toHaveBeenCalledWith('2027-01-08')
  })

  it('今天快捷按钮回调本地今天', () => {
    const onChange = vi.fn()
    render(<DatePicker value="" onChange={onChange} />)
    openPanel('选择日期')
    fireEvent.click(screen.getByRole('button', { name: '今天' }))
    expect(onChange).toHaveBeenCalledWith(todayInput())
  })

  it('有值且 clearable 时清除回调空串并收起', () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-08-19" onChange={onChange} />)
    openPanel(/2026-08-19/)
    fireEvent.click(screen.getByRole('button', { name: '清除' }))
    expect(onChange).toHaveBeenCalledWith('')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('clearable=false 时不渲染清除按钮', () => {
    render(<DatePicker value="2026-08-19" onChange={() => {}} clearable={false} />)
    openPanel(/2026-08-19/)
    expect(screen.queryByRole('button', { name: '清除' })).not.toBeInTheDocument()
  })

  it('max 之后的日期禁用、max 当日可选', () => {
    render(<DatePicker value="2026-08-19" onChange={() => {}} max="2026-08-19" />)
    openPanel(/2026-08-19/)
    expect(screen.getByRole('button', { name: '2026年8月20日' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '2026年8月31日' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '2026年8月19日' })).toBeEnabled()
  })

  it('「今天」快捷按钮同样受 max 约束：max 早于今天时禁用，晚于今天时可用', () => {
    const { unmount } = render(<DatePicker value="" onChange={() => {}} max="2020-01-01" />)
    openPanel('选择日期')
    expect(screen.getByRole('button', { name: '今天' })).toBeDisabled()
    unmount()
    render(<DatePicker value="" onChange={() => {}} max="2999-12-31" />)
    openPanel('选择日期')
    expect(screen.getByRole('button', { name: '今天' })).toBeEnabled()
  })

  it('disabled 触发器不可打开弹层', () => {
    render(<DatePicker value="2026-08-19" onChange={() => {}} disabled />)
    const trigger = screen.getByRole('button', { name: /2026-08-19/ })
    expect(trigger).toBeDisabled()
    fireEvent.click(trigger)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('id 落在触发器上（label htmlFor / E2E id locator 依赖）', () => {
    render(<DatePicker id="tf-due" value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '选择日期' })).toHaveAttribute('id', 'tf-due')
  })

  it('aria-label 透传到触发器作为可访问名', () => {
    render(<DatePicker aria-label="日报日期" value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '日报日期' })).toBeInTheDocument()
  })

  it('className 追加且不丢基础类', () => {
    render(<DatePicker value="" onChange={() => {}} className="w-36" />)
    const trigger = screen.getByRole('button', { name: '选择日期' })
    expect(trigger).toHaveClass('w-36')
    expect(trigger).toHaveClass('border-border-strong', 'bg-surface', 'text-sm')
  })
})
