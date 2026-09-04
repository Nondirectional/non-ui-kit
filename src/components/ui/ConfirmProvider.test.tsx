import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ConfirmProvider, useConfirm } from './ConfirmProvider'

/**
 * 探针组件：点击触发一次 confirm，resolve 值回调给测试
 * （clearText 区分两次调用，供并发用例确认首个弹窗未被顶替）。
 */
function Probe({
  onResult,
  danger = false,
}: {
  onResult: (value: boolean) => void
  danger?: boolean
}) {
  const { confirm } = useConfirm()
  return (
    <button
      type="button"
      onClick={() => {
        void confirm({
          title: '确认操作',
          description: '删除这条记录？',
          danger,
          confirmText: '删除',
        }).then(onResult)
      }}
    >
      open
    </button>
  )
}

function renderProbe(onResult: (value: boolean) => void, danger = false) {
  return render(
    <ConfirmProvider>
      <Probe onResult={onResult} danger={danger} />
    </ConfirmProvider>,
  )
}

describe('ConfirmProvider', () => {
  it('点确认按钮：resolve(true) 并关闭弹窗', async () => {
    const results: boolean[] = []
    renderProbe((v) => results.push(v))
    fireEvent.click(screen.getByRole('button', { name: 'open' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('确认操作')).toBeInTheDocument()
    expect(within(dialog).getByText('删除这条记录？')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: '删除' }))

    await act(async () => {})
    expect(results).toEqual([true])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('点取消按钮：resolve(false) 并关闭弹窗', async () => {
    const results: boolean[] = []
    renderProbe((v) => results.push(v))
    fireEvent.click(screen.getByRole('button', { name: 'open' }))

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))

    await act(async () => {})
    expect(results).toEqual([false])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('按 Esc 关闭：resolve(false)', async () => {
    const results: boolean[] = []
    renderProbe((v) => results.push(v))
    fireEvent.click(screen.getByRole('button', { name: 'open' }))
    await screen.findByRole('dialog')

    // Radix Dialog 在 document 上监听 keydown
    fireEvent.keyDown(document.body, { key: 'Escape' })

    await act(async () => {})
    expect(results).toEqual([false])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('danger=true：确认按钮为 danger-solid 红按钮；默认（非 danger）为 primary', async () => {
    const first = renderProbe(() => {}, true)
    fireEvent.click(screen.getByRole('button', { name: 'open' }))
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('button', { name: '删除' }),
    ).toHaveClass('bg-danger')
    first.unmount()

    // 非 danger：确认按钮回落 primary（不含 bg-danger）
    renderProbe(() => {}, false)
    fireEvent.click(screen.getByRole('button', { name: 'open' }))
    const nextDialog = await screen.findByRole('dialog')
    expect(
      within(nextDialog).getByRole('button', { name: '删除' }),
    ).not.toHaveClass('bg-danger')
  })

  it('弹窗打开期间再次 confirm 直接 resolve(false)，不排队、不顶替首个弹窗', async () => {
    const results: boolean[] = []
    renderProbe((v) => results.push(v))
    const openBtn = screen.getByRole('button', { name: 'open' })
    fireEvent.click(openBtn)
    const dialog = await screen.findByRole('dialog')

    // 首个弹窗未关闭时再次触发：第二个 confirm 立即 settle 为 false
    // （Radix 会把弹窗外内容标 aria-hidden，须复用已持有的按钮引用）
    fireEvent.click(openBtn)
    await act(async () => {})
    expect(results).toEqual([false])
    // 首个弹窗内容未被顶替，仍是第一次的描述
    expect(within(dialog).getByText('删除这条记录？')).toBeInTheDocument()

    // 关闭首个弹窗：resolve(true)，两个 promise 各自 settle 一次
    fireEvent.click(within(dialog).getByRole('button', { name: '删除' }))
    await act(async () => {})
    expect(results).toEqual([false, true])
  })
})
