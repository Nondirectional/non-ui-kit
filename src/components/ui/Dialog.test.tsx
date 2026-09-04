import { ComponentProps } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { AppDialog } from './Dialog'

function renderDialog(props: Partial<ComponentProps<typeof AppDialog>> = {}) {
  const onOpenChange = vi.fn()
  const utils = render(
    <AppDialog open onOpenChange={onOpenChange} title="新增任务" {...props}>
      <p>表单内容</p>
    </AppDialog>,
  )
  return { onOpenChange, ...utils }
}

describe('AppDialog 开关渲染', () => {
  it('open 时渲染 title / children / footer', () => {
    renderDialog({ footer: <button type="button">确定</button> })
    expect(screen.getByText('新增任务')).toBeInTheDocument()
    expect(screen.getByText('表单内容')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument()
  })

  it('open=false 时不渲染任何内容', () => {
    renderDialog({ open: false })
    expect(screen.queryByText('新增任务')).not.toBeInTheDocument()
    expect(screen.queryByText('表单内容')).not.toBeInTheDocument()
  })

  it('footer 缺省时不渲染底部按钮区', () => {
    renderDialog()
    expect(screen.queryByRole('button', { name: '确定' })).not.toBeInTheDocument()
  })
})

describe('AppDialog 关闭交互', () => {
  it('按 Esc 触发 onOpenChange(false)', () => {
    const { onOpenChange } = renderDialog()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('点击右上关闭按钮触发 onOpenChange(false)', () => {
    const { onOpenChange } = renderDialog()
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('AppDialog 宽度档', () => {
  it('默认 md：max-w-md', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md')
  })

  it('lg 档：max-w-lg 不残留 max-w-md', () => {
    renderDialog({ width: 'lg' })
    const panel = screen.getByRole('dialog')
    expect(panel).toHaveClass('max-w-lg')
    expect(panel).not.toHaveClass('max-w-md')
  })
})
