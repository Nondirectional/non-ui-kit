import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'
import { renderInTheme } from '../../test/theme'

describe('Badge 变体类串（soft 底 + 语义字色查表）', () => {
  it('默认 neutral：surface-hover 底 + fg-muted 字（模型名等中性标记）', () => {
    render(<Badge>glm-4.7</Badge>)
    expect(screen.getByText('glm-4.7')).toHaveClass(
      'bg-surface-hover',
      'text-fg-muted',
      'rounded-full',
      'text-xs',
      'font-medium',
    )
  })

  it.each([
    ['accent', ['bg-accent-soft', 'text-accent']],
    ['success', ['bg-success-soft', 'text-success']],
    ['warning', ['bg-warning-soft', 'text-warning']],
    ['danger', ['bg-danger-soft', 'text-danger']],
  ] as const)('%s 变体走对应语义 token', (variant, classes) => {
    render(<Badge variant={variant}>文案</Badge>)
    expect(screen.getByText('文案')).toHaveClass(...classes)
  })
})

describe('Badge dot 状态点', () => {
  it('dot=true 前置 8px 级圆点（6px，bg-current 随字色），对辅助技术隐藏', () => {
    const { container } = render(
      <Badge variant="success" dot>
        运行中
      </Badge>,
    )
    const dot = container.querySelector<HTMLSpanElement>('span > span[aria-hidden="true"]')
    expect(dot).not.toBeNull()
    expect(dot).toHaveClass('size-1.5', 'rounded-full', 'bg-current')
    expect(screen.getByText('运行中')).toHaveClass('text-success')
  })

  it('默认无 dot', () => {
    const { container } = render(<Badge>空闲</Badge>)
    expect(container.querySelector('span[aria-hidden="true"]')).toBeNull()
  })
})

describe('Badge 透传与主题契约', () => {
  it('className 追加与原生属性透传不丢基础类', () => {
    render(
      <Badge className="ml-2" data-status="live">
        LIVE
      </Badge>,
    )
    const badge = screen.getByText('LIVE')
    expect(badge).toHaveClass('ml-2', 'rounded-full')
    expect(badge).toHaveAttribute('data-status', 'live')
  })

  it('暗色容器下类串与亮色逐字一致（无 dark: 分支，主题由 token 翻转）', () => {
    const light = render(<Badge variant="warning">延迟</Badge>)
    const dark = renderInTheme(<Badge variant="warning">延迟</Badge>, 'dark')
    expect(dark.container.querySelector('.dark > span')!.className).toBe(
      light.container.querySelector('span')!.className,
    )
    expect(dark.container.querySelector('.dark > span')!.className).not.toMatch(/dark:/)
  })
})
