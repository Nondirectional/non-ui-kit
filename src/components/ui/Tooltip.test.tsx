import { afterEach, beforeEach, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Tooltip, TooltipProvider } from './Tooltip'

/** 悬停触发器并推进 delayDuration（300ms）后返回气泡节点（radix Trigger 监听 pointermove 开启延迟计时） */
function openTooltip(trigger: HTMLElement) {
  fireEvent.pointerMove(trigger, { pointerType: 'mouse' })
  act(() => {
    vi.advanceTimersByTime(400)
  })
  return screen.getByRole('tooltip')
}

describe('Tooltip 封装', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('未触发时只渲染 children，label 不在文档中', () => {
    render(
      <TooltipProvider>
        <Tooltip label="重命名">
          <button type="button">触发器</button>
        </Tooltip>
      </TooltipProvider>,
    )
    expect(screen.getByRole('button', { name: '触发器' })).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('悬停触发器后气泡出现，文案即 label', () => {
    render(
      <TooltipProvider>
        <Tooltip label="上移">
          <button type="button" aria-label="上移">
            ↑
          </button>
        </Tooltip>
      </TooltipProvider>,
    )
    const trigger = screen.getByRole('button', { name: '上移' })
    const bubble = openTooltip(trigger)
    expect(bubble).toHaveTextContent('上移')
  })

  it('气泡经 aria-describedby 与触发器关联（radix 无障碍语义）', () => {
    render(
      <TooltipProvider>
        <Tooltip label="删除">
          <button type="button" aria-label="删除">
            ×
          </button>
        </Tooltip>
      </TooltipProvider>,
    )
    const trigger = screen.getByRole('button', { name: '删除' })
    const bubble = openTooltip(trigger)
    expect(trigger).toHaveAttribute('aria-describedby', bubble.id)
  })

  it('children 原有属性保留：aria-label / className / onClick 原样透传', () => {
    const onClick = vi.fn()
    render(
      <TooltipProvider>
        <Tooltip label="切换为已完成">
          <button type="button" aria-label="切换为已完成" className="rounded p-0.5" onClick={onClick}>
            ○
          </button>
        </Tooltip>
      </TooltipProvider>,
    )
    const trigger = screen.getByRole('button', { name: '切换为已完成' })
    expect(trigger).toHaveClass('rounded', 'p-0.5')
    fireEvent.click(trigger)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('label 为空时不挂 tooltip，children 原样渲染且无 aria-describedby', () => {
    render(
      <TooltipProvider>
        <Tooltip label={undefined}>
          <button type="button">保存</button>
        </Tooltip>
      </TooltipProvider>,
    )
    const trigger = screen.getByRole('button', { name: '保存' })
    expect(trigger).not.toHaveAttribute('aria-describedby')
    fireEvent.pointerMove(trigger, { pointerType: 'mouse' })
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
