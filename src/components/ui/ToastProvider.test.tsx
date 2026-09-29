import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from './ToastProvider'

/** 探针组件：暴露四级 kind 触发按钮 */
function Probe() {
  const toast = useToast()
  return (
    <>
      <button type="button" onClick={() => toast.error('操作失败，请稍后重试')}>
        fire-error
      </button>
      <button type="button" onClick={() => toast.success('草稿已保存')}>
        fire-success
      </button>
      <button type="button" onClick={() => toast.info('supervisor 已启动')}>
        fire-info
      </button>
      <button type="button" onClick={() => toast.warning('端口已被占用')}>
        fire-warning
      </button>
    </>
  )
}

function renderProbe() {
  return render(
    <ToastProvider>
      <Probe />
    </ToastProvider>,
  )
}

describe('ToastProvider', () => {
  it('error：渲染文案且 role=alert（danger 语义边框）', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'fire-error' }))

    const toast = screen.getByRole('alert')
    expect(toast).toHaveTextContent('操作失败，请稍后重试')
    expect(toast).toHaveClass('border-danger')
  })

  it('success：渲染文案且 role=status（success 语义边框）', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'fire-success' }))

    const toast = screen.getByRole('status')
    expect(toast).toHaveTextContent('草稿已保存')
    expect(toast).toHaveClass('border-success')
  })

  it('info：渲染文案且 role=status（中性描边，过程性反馈）', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'fire-info' }))

    const toast = screen.getByRole('status')
    expect(toast).toHaveTextContent('supervisor 已启动')
    expect(toast).toHaveClass('border-fg-subtle')
  })

  it('warning：渲染文案且 role=alert（warning 语义边框）', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'fire-warning' }))

    const toast = screen.getByRole('alert')
    expect(toast).toHaveTextContent('端口已被占用')
    expect(toast).toHaveClass('border-warning')
  })

  it('点击条目立即关闭（不等待自动消失）', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'fire-error' }))
    fireEvent.click(screen.getByRole('alert'))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('多条 Toast 顶部居中堆叠展示', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'fire-error' }))
    fireEvent.click(screen.getByRole('button', { name: 'fire-error' }))
    fireEvent.click(screen.getByRole('button', { name: 'fire-success' }))

    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(screen.getAllByRole('status')).toHaveLength(1)
  })
})

describe('ToastProvider 自动消失', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('3.5s 后自动消失', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'fire-error' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3500)
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('每条独立计时：先后两条依次消失', () => {
    renderProbe()
    fireEvent.click(screen.getByRole('button', { name: 'fire-error' }))
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    fireEvent.click(screen.getByRole('button', { name: 'fire-success' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()

    // 第一条到点消失，第二条还剩 2s
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
