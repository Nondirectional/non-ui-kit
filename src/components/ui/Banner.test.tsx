import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Banner } from './Banner'

describe('Banner', () => {
  it('warning：soft 底语义色 + role=alert + 前置三角图标', () => {
    render(<Banner tone="warning">端口 16380 已被占用</Banner>)
    const banner = screen.getByRole('alert')
    expect(banner).toHaveTextContent('端口 16380 已被占用')
    expect(banner).toHaveClass('bg-warning-soft', 'text-warning')
  })

  it('danger：role=alert，danger soft 底', () => {
    render(<Banner tone="danger">agent 连接失败</Banner>)
    const banner = screen.getByRole('alert')
    expect(banner).toHaveClass('bg-danger-soft', 'text-danger')
  })

  it('info（默认）：中性呈现 + role=status', () => {
    render(<Banner>提示内容</Banner>)
    const banner = screen.getByRole('status')
    expect(banner).toHaveClass('bg-surface-hover', 'text-fg-muted')
  })

  it('图标列 aria-hidden，正文 children 在提示条内完整呈现', () => {
    render(
      <Banner tone="warning">
        <p>第一行</p>
        <p>第二行</p>
      </Banner>,
    )
    const banner = screen.getByRole('alert')
    expect(banner.querySelector('span[aria-hidden]')).not.toBeNull()
    expect(banner).toHaveTextContent('第一行第二行')
  })
})
