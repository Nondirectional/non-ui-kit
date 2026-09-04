import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Dot } from './Dot'

describe('Dot', () => {
  it('渲染 8px 危险色圆点（语义 token），圆点本身对辅助技术隐藏', () => {
    const { container } = render(<Dot label="有 2 条待办" />)
    const dot = container.querySelector('span[aria-hidden]')
    expect(dot).not.toBeNull()
    expect(dot).toHaveClass('size-2', 'rounded-full', 'bg-danger')
  })

  it('sr-only 文案对屏幕阅读器可读（状态不单靠颜色传达）', () => {
    render(<Dot label="有 3 条待办" />)
    expect(screen.getByText('有 3 条待办')).toHaveClass('sr-only')
  })
})
