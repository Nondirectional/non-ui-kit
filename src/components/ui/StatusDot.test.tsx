import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusDot } from './StatusDot'

describe('StatusDot', () => {
  it('on：实心 success 圆点，aria-hidden', () => {
    const { container } = render(<StatusDot state="on" label="可连通" />)
    const dot = container.querySelector('span[aria-hidden]')
    expect(dot).not.toBeNull()
    expect(dot).toHaveClass('size-2', 'rounded-full', 'bg-success')
  })

  it('off：实心中性灰圆点', () => {
    const { container } = render(<StatusDot state="off" label="不可连通" />)
    const dot = container.querySelector('span[aria-hidden]')
    expect(dot).toHaveClass('bg-fg-subtle')
  })

  it('unknown：空心圆（描边透底，与 off 实心灰形态可区分）', () => {
    const { container } = render(<StatusDot state="unknown" label="未探测" />)
    const dot = container.querySelector('span[aria-hidden]')
    expect(dot).toHaveClass('border', 'border-fg-subtle', 'bg-transparent')
  })

  it('sr-only 文案对屏幕阅读器可读（状态不单靠颜色/形态传达）', () => {
    render(<StatusDot state="on" label="可连通" />)
    expect(screen.getByText('可连通')).toHaveClass('sr-only')
  })
})
