import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './Switch'
import { renderInTheme } from '../../test/theme'

function renderSwitch(props = {}) {
  return render(<Switch aria-label="自动刷新" {...props} />)
}

describe('Switch 受控切换', () => {
  it('默认渲染 role=switch 未选态', () => {
    renderSwitch()
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('data-state', 'unchecked')
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('checked=true → data-state=checked + 轨道 accent 类命中', () => {
    renderSwitch({ checked: true })
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(sw).toHaveClass('data-[state=checked]:bg-accent', 'data-[state=checked]:border-accent')
    expect(sw.querySelector('[data-state="checked"]')).not.toBeNull() // Thumb 同步翻转
  })

  it('点击未选开关 → onCheckedChange(true)', () => {
    const onCheckedChange = vi.fn()
    renderSwitch({ onCheckedChange })
    fireEvent.click(screen.getByRole('switch'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('点击已选开关 → onCheckedChange(false)（翻转语义）', () => {
    const onCheckedChange = vi.fn()
    renderSwitch({ checked: true, onCheckedChange })
    fireEvent.click(screen.getByRole('switch'))
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it('disabled 不可交互', () => {
    const onCheckedChange = vi.fn()
    renderSwitch({ disabled: true, onCheckedChange })
    const sw = screen.getByRole('switch')
    expect(sw).toBeDisabled()
    expect(sw).toHaveClass('disabled:opacity-50')
    fireEvent.click(sw)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})

describe('Switch 视觉与透传', () => {
  it('轨道 36×20（h-5 w-9 p-0.5）+ 滑块 16px（size-4 translate-x-4 对称位移）', () => {
    renderSwitch()
    const sw = screen.getByRole('switch')
    expect(sw).toHaveClass('h-5', 'w-9', 'p-0.5', 'rounded-full', 'bg-surface-hover')
    expect(sw.firstElementChild).toHaveClass('size-4', 'rounded-full', 'bg-fg', 'data-[state=checked]:translate-x-4')
  })

  it('className 只追加布局类不丢轨道基类', () => {
    renderSwitch({ className: 'mt-1' })
    expect(screen.getByRole('switch')).toHaveClass('mt-1', 'rounded-full')
  })

  it('暗色容器下受控切换行为与类串不变（无 dark: 分支）', () => {
    const onCheckedChange = vi.fn()
    const dark = renderInTheme(
      <Switch aria-label="自动刷新" checked={false} onCheckedChange={onCheckedChange} />,
      'dark',
    )
    const sw = dark.getByRole('switch')
    expect(sw.className).not.toMatch(/dark:/)
    fireEvent.click(sw)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(sw).toHaveAttribute('data-state', 'unchecked') // 受控铁律：checked 由外部决定
  })
})
