import { useState } from 'react'
import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DateTimePicker } from './DateTimePicker'

/** 受控回路 harness：onChange 真实写回 state，验证往返序列化 */
function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return <DateTimePicker value={value} onChange={setValue} />
}

function openPanel(triggerName: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name: triggerName }))
  return screen.getByRole('dialog', { name: '选择日期时间' })
}

/** 空值起步的日历显示当月，日期按钮必须动态取今天，不能硬编码月份 */
function todayName() {
  const now = new Date()
  const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
  const label = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
  return { ymd, label }
}

describe('DateTimePicker 封装', () => {
  it('回显：T 渲染为空格分隔，空值显示 placeholder', () => {
    const { rerender } = render(<DateTimePicker value="2026-08-19T14:30" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /2026-08-19 14:30/ })).toHaveTextContent(
      '2026-08-19 14:30',
    )
    rerender(<DateTimePicker value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '选择日期时间' })).toHaveTextContent('选择日期时间')
  })

  it('组合值往返：点日期保留已有时段，且弹层不自动收起', () => {
    render(<Harness initial="2026-08-19T14:30" />)
    openPanel(/2026-08-19 14:30/)
    fireEvent.click(screen.getByRole('button', { name: '2026年8月20日' }))
    expect(screen.getByRole('button', { name: /2026-08-20 14:30/ })).toHaveTextContent(
      '2026-08-20 14:30',
    )
    // 选完日期还要校对时间，弹层保持打开
    expect(screen.getByRole('dialog', { name: '选择日期时间' })).toBeInTheDocument()
  })

  it('空值起步：时间行显示 09:00 占位，选日期默认 09:00', () => {
    render(<Harness />)
    openPanel('选择日期时间')
    const { ymd, label } = todayName()
    const hour = screen.getByLabelText('小时')
    const minute = screen.getByLabelText('分钟')
    expect(hour).toHaveAttribute('placeholder', '09')
    expect((hour as HTMLInputElement).value).toBe('')
    expect(minute).toHaveAttribute('placeholder', '00')
    fireEvent.click(screen.getByRole('button', { name: label }))
    expect(screen.getByRole('button', { name: new RegExp(`${ymd} 09:00`) })).toBeInTheDocument()
    // 选日期后占位转实值
    expect((screen.getByLabelText('小时') as HTMLInputElement).value).toBe('09')
    expect((screen.getByLabelText('分钟') as HTMLInputElement).value).toBe('00')
  })

  it('只改时间：失焦提交并回显（含补零与 clamp）', () => {
    render(<Harness initial="2026-08-19T14:30" />)
    openPanel(/2026-08-19 14:30/)
    const hour = screen.getByLabelText('小时') as HTMLInputElement

    fireEvent.change(hour, { target: { value: '9' } })
    fireEvent.blur(hour)
    expect(screen.getByRole('button', { name: /2026-08-19 09:30/ })).toBeInTheDocument()

    fireEvent.change(hour, { target: { value: '99' } })
    fireEvent.blur(hour)
    expect(screen.getByRole('button', { name: /2026-08-19 23:30/ })).toBeInTheDocument()

    const minute = screen.getByLabelText('分钟') as HTMLInputElement
    fireEvent.change(minute, { target: { value: '5' } })
    fireEvent.blur(minute)
    expect(screen.getByRole('button', { name: /2026-08-19 23:05/ })).toBeInTheDocument()
  })

  it('清空时间视为放弃编辑：还原并保持原值', () => {
    render(<Harness initial="2026-08-19T14:30" />)
    openPanel(/2026-08-19 14:30/)
    const hour = screen.getByLabelText('小时') as HTMLInputElement
    fireEvent.change(hour, { target: { value: '' } })
    fireEvent.blur(hour)
    expect(hour.value).toBe('14')
    expect(screen.getByRole('button', { name: /2026-08-19 14:30/ })).toBeInTheDocument()
  })

  it('尚无日期时改时间不触发 onChange，选日期后带草稿时段汇总', () => {
    const onChange = vi.fn()
    render(<DateTimePicker value="" onChange={onChange} />)
    openPanel('选择日期时间')
    const hour = screen.getByLabelText('小时') as HTMLInputElement
    fireEvent.change(hour, { target: { value: '8' } })
    fireEvent.blur(hour)
    expect(onChange).not.toHaveBeenCalled()
    const { ymd, label } = todayName()
    fireEvent.click(screen.getByRole('button', { name: label }))
    expect(onChange).toHaveBeenCalledWith(`${ymd}T08:00`)
  })

  it('disabled 触发器不可打开弹层', () => {
    render(<DateTimePicker value="2026-08-19T14:30" onChange={() => {}} disabled />)
    const trigger = screen.getByRole('button', { name: /2026-08-19 14:30/ })
    expect(trigger).toBeDisabled()
    fireEvent.click(trigger)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('id 落在触发器上（label htmlFor 依赖）', () => {
    render(<DateTimePicker id="dp-expected-at" value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '选择日期时间' })).toHaveAttribute(
      'id',
      'dp-expected-at',
    )
  })
})
