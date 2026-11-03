import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'
import { renderInTheme } from '../../test/theme'

function renderCheckbox(props = {}) {
  return render(<Checkbox aria-label="启用" {...props} />)
}

describe('Checkbox 受控切换', () => {
  it('默认渲染 role=checkbox 未选态', () => {
    renderCheckbox()
    const cb = screen.getByRole('checkbox')
    expect(cb).toHaveAttribute('aria-checked', 'false')
    expect(cb).toHaveAttribute('data-state', 'unchecked')
  })

  it('checked=true → data-state=checked + accent 类命中 + 勾图标', () => {
    renderCheckbox({ checked: true })
    const cb = screen.getByRole('checkbox')
    expect(cb).toHaveAttribute('aria-checked', 'true')
    expect(cb).toHaveAttribute('data-state', 'checked')
    expect(cb).toHaveClass('data-[state=checked]:bg-accent', 'data-[state=checked]:border-accent')
    expect(cb.querySelector('svg')).not.toBeNull()
  })

  it('点击未选 → onCheckedChange(true)', () => {
    const onCheckedChange = vi.fn()
    renderCheckbox({ onCheckedChange })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('点击已选 → onCheckedChange(false)（翻转语义）', () => {
    const onCheckedChange = vi.fn()
    renderCheckbox({ checked: true, onCheckedChange })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it('checked="indeterminate" → data-state=indeterminate + 横线可见', () => {
    renderCheckbox({ checked: 'indeterminate' })
    const cb = screen.getByRole('checkbox')
    expect(cb).toHaveAttribute('aria-checked', 'mixed')
    expect(cb).toHaveAttribute('data-state', 'indeterminate')
    expect(cb.querySelector('svg')).toBeNull()
    expect(cb.querySelector('span span')).toHaveClass('block', 'h-0.5', 'w-2', 'rounded-full', 'bg-accent-fg')
  })

  it('disabled 不可交互', () => {
    const onCheckedChange = vi.fn()
    renderCheckbox({ disabled: true, onCheckedChange })
    const cb = screen.getByRole('checkbox')
    expect(cb).toBeDisabled()
    expect(cb).toHaveClass('disabled:opacity-50')
    fireEvent.click(cb)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})

describe('Checkbox 视觉与透传', () => {
  it('16px 方块 + 4px 圆角（与 RadioGroupItem 尺寸对齐）', () => {
    renderCheckbox()
    expect(screen.getByRole('checkbox')).toHaveClass('size-4', 'rounded-[4px]', 'border-border-strong', 'bg-surface')
  })

  it('className 只追加布局类不丢基类', () => {
    renderCheckbox({ className: 'mt-1' })
    const cb = screen.getByRole('checkbox')
    expect(cb).toHaveClass('mt-1', 'size-4', 'rounded-[4px]')
  })

  it('暗色容器下受控行为与类串不变（无 dark: 分支）', () => {
    const onCheckedChange = vi.fn()
    const dark = renderInTheme(
      <Checkbox aria-label="启用" checked={false} onCheckedChange={onCheckedChange} />,
      'dark',
    )
    const cb = dark.getByRole('checkbox')
    expect(cb.className).not.toMatch(/dark:/)
    fireEvent.click(cb)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(cb).toHaveAttribute('data-state', 'unchecked') // 受控铁律：checked 由外部决定
  })
})
