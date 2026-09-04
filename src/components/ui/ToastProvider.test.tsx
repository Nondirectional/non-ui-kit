import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from './ToastProvider'

/** 探针组件：暴露 error/success 两个触发按钮 */
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
