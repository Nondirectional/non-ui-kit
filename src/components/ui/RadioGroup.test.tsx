import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RadioGroup, RadioGroupItem } from './RadioGroup'

function renderGroup(props = {}) {
  return render(
    <RadioGroup aria-label="文件类型" {...props}>
      <RadioGroupItem value="sop" aria-label="SOP" />
      <RadioGroupItem value="stp" aria-label="STP" />
    </RadioGroup>,
  )
}

describe('RadioGroup 受控选择', () => {
  it('渲染 role=radiogroup 与两个 radio，默认全部未选', () => {
    renderGroup()
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    radios.forEach((r) => expect(r).toHaveAttribute('data-state', 'unchecked'))
  })

  it('value 命中项 data-state=checked 且渲染 Indicator 圆点', () => {
    renderGroup({ value: 'sop' })
    const checked = screen.getByRole('radio', { name: 'SOP' })
    expect(checked).toHaveAttribute('data-state', 'checked')
    expect(checked.firstElementChild).toHaveClass('size-2', 'rounded-full', 'bg-accent')
  })

  it('点击未选项 → onValueChange(该项 value)', () => {
    const onValueChange = vi.fn()
    renderGroup({ onValueChange })
    fireEvent.click(screen.getByRole('radio', { name: 'STP' }))
    expect(onValueChange).toHaveBeenCalledWith('stp')
  })

  it('点击已选项不触发 onValueChange（radio 语义，不取消选择）', () => {
    const onValueChange = vi.fn()
    renderGroup({ value: 'sop', onValueChange })
    const sop = screen.getByRole('radio', { name: 'SOP' })
    fireEvent.click(sop)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(sop).toHaveAttribute('data-state', 'checked')
  })

  it('disabled 项不可交互且半透明', () => {
    render(
      <RadioGroup aria-label="文件类型" value="sop">
        <RadioGroupItem value="sop" aria-label="SOP" />
        <RadioGroupItem value="stp" aria-label="STP" disabled />
      </RadioGroup>,
    )
    const stp = screen.getByRole('radio', { name: 'STP' })
    expect(stp).toBeDisabled()
    expect(stp).toHaveClass('disabled:opacity-50')
  })

  it('选中项圆圈边框 accent、默认纵向堆叠可被 className 覆盖', () => {
    render(
      <RadioGroup aria-label="文件类型" value="sop" className="flex-row gap-4">
        <RadioGroupItem value="sop" aria-label="SOP" />
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup')).toHaveClass('flex-col', 'flex-row')
    expect(screen.getByRole('radio')).toHaveClass(
      'size-4',
      'rounded-full',
      'border-border-strong',
      'data-[state=checked]:border-accent',
    )
  })
})
