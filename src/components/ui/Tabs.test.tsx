import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'
import { renderInTheme } from '../../test/theme'

/** 看板粒度切换的典型接线（小时/天/周/月） */
function renderTabs(props: { value?: string; onValueChange?: (v: string) => void } = {}) {
  return render(
    <Tabs defaultValue="day" {...props}>
      <TabsList aria-label="粒度">
        <TabsTrigger value="hour">小时</TabsTrigger>
        <TabsTrigger value="day">天</TabsTrigger>
        <TabsTrigger value="week">周</TabsTrigger>
        <TabsTrigger value="month">月</TabsTrigger>
      </TabsList>
      <TabsContent value="hour">按小时聚合</TabsContent>
      <TabsContent value="day">按天聚合</TabsContent>
      <TabsContent value="week">按周聚合</TabsContent>
      <TabsContent value="month">按月聚合</TabsContent>
    </Tabs>,
  )
}

/** Radix Tabs Trigger 在 mousedown（左键）与 focus 时激活，不走 click——
 * fireEvent.click 只派发 click 事件，需补 mousedown 模拟真实指针序列 */
function clickTab(tab: HTMLElement) {
  fireEvent.mouseDown(tab)
  fireEvent.click(tab)
}

describe('Tabs 非受控（defaultValue）', () => {
  it('默认面板激活：tablist/tab 角色齐全，选中 tab aria-selected', () => {
    renderTabs()
    expect(screen.getByRole('tablist', { name: '粒度' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '天', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '小时', selected: false })).toBeInTheDocument()
    expect(screen.getByText('按天聚合')).toBeVisible()
    // Radix Tabs：从未激活的 Content 不挂载；激活过再切走的保留 DOM（hidden）
    expect(screen.queryByText('按小时聚合')).toBeNull()
  })

  it('点击其他 tab 切换面板', () => {
    renderTabs()
    clickTab(screen.getByRole('tab', { name: '周' }))
    expect(screen.getByRole('tab', { name: '周', selected: true })).toBeInTheDocument()
    expect(screen.getByText('按周聚合')).toBeVisible()
    // Radix Tabs：非激活 Content 只保留空壳 div（hidden），children 不渲染
    expect(screen.queryByText('按天聚合')).toBeNull()
  })

  it('方向键漫游激活（Radix automatic：ArrowRight 天 → 周）', async () => {
    renderTabs()
    const day = screen.getByRole('tab', { name: '天' })
    fireEvent.focus(day) // 键盘路径先聚焦（automatic 模式下聚焦即激活）
    fireEvent.keyDown(day, { key: 'ArrowRight' })
    // Radix 的焦点移动在 setTimeout 里派发（防布局抖动），异步等待
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: '周', selected: true })).toBeInTheDocument(),
    )
    expect(screen.getByText('按周聚合')).toBeVisible()
  })
})

describe('Tabs 受控', () => {
  it('点击只派发 onValueChange，面板不变（受控铁律）', () => {
    const onValueChange = vi.fn()
    renderTabs({ value: 'day', onValueChange })
    clickTab(screen.getByRole('tab', { name: '月' }))
    expect(onValueChange).toHaveBeenCalledWith('month')
    expect(screen.getByText('按天聚合')).toBeVisible()
    expect(screen.queryByText('按月聚合')).toBeNull() // 受控未变 + 从未激活：不挂载
  })

  it('外部 value 变化驱动面板切换', () => {
    const { rerender } = renderTabs({ value: 'day' })
    rerender(
      <Tabs value="month">
        <TabsList aria-label="粒度">
          <TabsTrigger value="day">天</TabsTrigger>
          <TabsTrigger value="month">月</TabsTrigger>
        </TabsList>
        <TabsContent value="day">按天聚合</TabsContent>
        <TabsContent value="month">按月聚合</TabsContent>
      </Tabs>,
    )
    expect(screen.getByText('按月聚合')).toBeInTheDocument()
  })
})

describe('Tabs 视觉与主题契约', () => {
  it('List 内凹容器（bg-sidebar）+ 选中 Trigger accent 实心胶囊', () => {
    renderTabs()
    expect(screen.getByRole('tablist')).toHaveClass(
      'inline-flex',
      'rounded-md',
      'bg-sidebar',
      'p-0.5',
    )
    const day = screen.getByRole('tab', { name: '天' })
    expect(day).toHaveClass('data-[state=active]:bg-accent', 'data-[state=active]:text-accent-fg')
    expect(screen.getByRole('tab', { name: '小时' })).toHaveClass(
      'data-[state=inactive]:hover:text-fg',
    )
  })

  it('暗色容器下点击切换行为与类串不变（无 dark: 分支）', () => {
    const dark = renderInTheme(
      <Tabs defaultValue="hour">
        <TabsList>
          <TabsTrigger value="hour">小时</TabsTrigger>
          <TabsTrigger value="day">天</TabsTrigger>
        </TabsList>
        <TabsContent value="hour">按小时聚合</TabsContent>
        <TabsContent value="day">按天聚合</TabsContent>
      </Tabs>,
      'dark',
    )
    const list = dark.getByRole('tablist')
    expect(list.className).not.toMatch(/dark:/)
    clickTab(dark.getByRole('tab', { name: '天' }))
    expect(dark.getByText('按天聚合')).toBeVisible()
    expect(dark.queryByText('按小时聚合')).toBeNull()
  })
})
