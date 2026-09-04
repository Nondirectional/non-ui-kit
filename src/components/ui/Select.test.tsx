import type { ReactElement } from 'react'
import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Select, SelectItem } from './Select'

const OPTIONS = (
  <>
    <SelectItem value="todo">待办</SelectItem>
    <SelectItem value="doing">进行中</SelectItem>
    <SelectItem value="done" disabled>
      已完成
    </SelectItem>
  </>
)

/** 打开弹层：click 触发器（jsdom 无 pointerType，radix 走非 mouse 的 click 打开分支） */
function openListbox() {
  fireEvent.click(screen.getByRole('combobox'))
  return screen.getByRole('listbox')
}

describe('Select 封装', () => {
  it('触发器为 combobox，选项以 option role 渲染在弹层 listbox 中', () => {
    render(
      <Select value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
    openListbox()
    expect(screen.getByRole('option', { name: '待办' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '进行中' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '已完成' })).toBeInTheDocument()
  })

  it('受控回显：value 命中选项时触发器显示选项文案', () => {
    render(
      <Select value="doing" onValueChange={() => {}}>
        {OPTIONS}
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('进行中')
  })

  it('未选态：value 空串映射为 placeholder 显示', () => {
    render(
      <Select value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('请选择')
  })

  it('点击选项触发 onValueChange 并回显', () => {
    const onValueChange = vi.fn()
    render(
      <Select value="" onValueChange={onValueChange} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    openListbox()
    fireEvent.click(screen.getByRole('option', { name: '进行中' }))
    expect(onValueChange).toHaveBeenCalledWith('doing')
  })

  it('disabled 时触发器不可交互且无 listbox 弹层属性', () => {
    render(
      <Select value="todo" onValueChange={() => {}} disabled>
        {OPTIONS}
      </Select>,
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveTextContent('待办')
  })

  it('SelectItem disabled 渲染为不可用选项（aria-disabled）', () => {
    render(
      <Select value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    openListbox()
    expect(screen.getByRole('option', { name: '已完成' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('id 落在触发器上（label htmlFor / E2E id locator 依赖）', () => {
    render(
      <Select id="fb-customer" value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'fb-customer')
  })

  it('aria-label 透传到触发器作为可访问名', () => {
    render(
      <Select aria-label="按状态筛选" value="" onValueChange={() => {}}>
        {OPTIONS}
      </Select>,
    )
    expect(screen.getByRole('combobox', { name: '按状态筛选' })).toBeInTheDocument()
  })

  it('宽度变体：默认 w-full（表单满宽），width="auto" 换为内容宽', () => {
    const { rerender } = render(
      <Select value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    // 类名断言仅针对宽度变体这一组件自身逻辑（消费者不允许再用 w-* 覆盖）
    expect(screen.getByRole('combobox')).toHaveClass('w-full')
    rerender(
      <Select value="" onValueChange={() => {}} placeholder="请选择" width="auto">
        {OPTIONS}
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveClass('w-auto')
    expect(screen.getByRole('combobox')).not.toHaveClass('w-full')
  })

  it('className 追加且不丢基础类（mt-1 布局类与视觉类共存）', () => {
    render(
      <Select value="" onValueChange={() => {}} placeholder="请选择" className="mt-1">
        {OPTIONS}
      </Select>,
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveClass('mt-1')
    expect(trigger).toHaveClass('border-border-strong', 'bg-surface', 'text-sm')
  })

  it('未开启 searchable（默认）：弹层内无搜索框（Radix 路径渲染不变）', () => {
    render(
      <Select value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    openListbox()
    expect(screen.getByRole('option', { name: '待办' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: '搜索' })).not.toBeInTheDocument()
  })

  // 08-25-select-scroll-lock：Viewport 限高防漂移——桌面自适应可用高度、移动保持 288px
  it('Radix 路径 Viewport 限高类串：桌面 min(288px, select 可用高度) / 移动固定 288px', () => {
    render(
      <Select value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    openListbox()
    const viewport = document.querySelector('[data-radix-select-viewport]')
    expect(viewport).not.toBeNull()
    expect(viewport).toHaveClass(
      'max-md:max-h-72',
      'md:max-h-[min(18rem,var(--radix-select-content-available-height,18rem))]',
      'overflow-y-auto',
    )
  })
})

/** searchable 分支：Popover 底层也是 click 打开（jsdom 与 Radix Select 路径一致） */
function openSearchableListbox(ui: ReactElement) {
  render(ui)
  fireEvent.click(screen.getByRole('combobox'))
  return screen.getByRole('listbox')
}

/** 打开 searchable 弹层并返回搜索输入框（多数用例的入口） */
function openWithSearch(ui: ReactElement) {
  openSearchableListbox(ui)
  return screen.getByRole('textbox', { name: '搜索' })
}

describe('Select searchable 搜索分支', () => {
  const MIXED_OPTIONS = (
    <>
      <SelectItem value="a1">Android 端</SelectItem>
      <SelectItem value="i2">iOS 端</SelectItem>
      <SelectItem value="w3">Web 端</SelectItem>
    </>
  )

  it('打开弹层出现搜索框并自动聚焦；键入即过滤（大小写不敏感子串），清空恢复全量', () => {
    const input = openWithSearch(
      <Select searchable value="" onValueChange={() => {}} placeholder="请选择">
        {MIXED_OPTIONS}
      </Select>,
    )
    expect(input).toHaveFocus()
    fireEvent.change(input, { target: { value: 'ios' } })
    expect(screen.getByRole('option', { name: 'iOS 端' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Android 端' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Web 端' })).not.toBeInTheDocument()
    fireEvent.change(input, { target: { value: '' } })
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('过滤无匹配：显示「无匹配选项」空态行，且不占用 option role', () => {
    const input = openWithSearch(
      <Select searchable value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    fireEvent.change(input, { target: { value: '不存在的选项' } })
    expect(screen.getByText('无匹配选项')).toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('↑↓ 移动高亮（aria-activedescendant 跟随），Enter 选中高亮项并关闭弹层', () => {
    const onValueChange = vi.fn()
    const input = openWithSearch(
      <Select searchable value="" onValueChange={onValueChange} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: '待办' }).id)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: '进行中' }).id)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('doing')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('ArrowUp 自末项循环、Home/End 跳首尾；高亮停在 disabled 项时 Enter 不回调不关闭', () => {
    const onValueChange = vi.fn()
    const input = openWithSearch(
      <Select searchable value="" onValueChange={onValueChange} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    fireEvent.keyDown(input, { key: 'ArrowUp' }) // 首项 → 末项（已完成，disabled）
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: '已完成' }).id)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Home' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('todo')
  })

  it('点击 option 触发 onValueChange 并关闭弹层；选中项 aria-selected', () => {
    const onValueChange = vi.fn()
    openSearchableListbox(
      <Select searchable value="todo" onValueChange={onValueChange} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    expect(screen.getByRole('option', { name: '待办' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: '进行中' })).toHaveAttribute('aria-selected', 'false')
    fireEvent.click(screen.getByRole('option', { name: '进行中' }))
    expect(onValueChange).toHaveBeenCalledWith('doing')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('受控 value 切换：触发器文本按 value→label 查表回显，未选走 placeholder 视觉', () => {
    const { rerender } = render(
      <Select searchable value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('请选择')
    expect(trigger).toHaveAttribute('data-placeholder', '')
    rerender(
      <Select searchable value="done" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    expect(trigger).toHaveTextContent('已完成')
    expect(trigger).not.toHaveAttribute('data-placeholder')
  })

  it('哨兵 SelectItem（非空串 value，如 __none__）按普通选项参与选择', () => {
    const onValueChange = vi.fn()
    openSearchableListbox(
      <Select searchable value="" onValueChange={onValueChange} placeholder="请选择">
        <SelectItem value="__none__">全部</SelectItem>
        <SelectItem value="todo">待办</SelectItem>
      </Select>,
    )
    fireEvent.click(screen.getByRole('option', { name: '全部' }))
    expect(onValueChange).toHaveBeenCalledWith('__none__')
  })

  it('Esc 关闭弹层；重新打开搜索词已清空、选项恢复全量', () => {
    const input = openWithSearch(
      <Select searchable value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    fireEvent.change(input, { target: { value: '待办' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('combobox'))
    const reopened = screen.getByRole('textbox', { name: '搜索' })
    expect(reopened).toHaveValue('')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('选中关闭（程序性，非 Esc）后重新打开：搜索词同样已清空、选项恢复全量', () => {
    const input = openWithSearch(
      <Select searchable value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    fireEvent.change(input, { target: { value: '进行' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.click(screen.getByRole('option', { name: '进行中' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('combobox'))
    const reopened = screen.getByRole('textbox', { name: '搜索' })
    expect(reopened).toHaveValue('')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('SelectItem children 非纯文本：不参与过滤始终显示，dev 下告警', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const input = openWithSearch(
      <Select searchable value="" onValueChange={() => {}} placeholder="请选择">
        <SelectItem value="a">选项甲</SelectItem>
        <SelectItem value="b">
          <span>选项乙</span>
        </SelectItem>
      </Select>,
    )
    fireEvent.change(input, { target: { value: '甲' } })
    expect(screen.getByRole('option', { name: '选项甲' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '选项乙' })).toBeInTheDocument() // 兜底：始终显示
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('searchable 触发器契约同形：id / aria-label / 宽度变体 / 布局类追加', () => {
    render(
      <Select
        searchable
        id="s1"
        aria-label="按人筛选"
        width="auto"
        className="mt-1"
        value=""
        onValueChange={() => {}}
        placeholder="请选择"
      >
        {OPTIONS}
      </Select>,
    )
    const trigger = screen.getByRole('combobox', { name: '按人筛选' })
    expect(trigger).toHaveAttribute('id', 's1')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveClass('w-auto', 'mt-1', 'border-border-strong')
    expect(trigger).not.toHaveClass('w-full')
  })

  it('disabled 触发器不可打开弹层', () => {
    render(
      <Select searchable disabled value="todo" onValueChange={() => {}}>
        {OPTIONS}
      </Select>,
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
    expect(trigger).toHaveTextContent('待办')
    fireEvent.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  // 08-25-select-scroll-lock：Popover 非 modal 无内建滚动锁，RemoveScroll 包裹补齐——
  // 打开期间页面（body）滚动被锁，关闭恢复（与 Radix Select modal 路径行为对齐）
  it('弹层打开期间 body 滚动被锁，关闭后恢复', () => {
    expect(getComputedStyle(document.body).overflow).not.toBe('hidden')
    const input = openWithSearch(
      <Select searchable value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    expect(getComputedStyle(document.body).overflow).toBe('hidden')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(getComputedStyle(document.body).overflow).not.toBe('hidden')
  })

  it('listbox 限高类串防漂移：桌面 min(288px, popover 可用高度) / 移动固定 288px', () => {
    const listbox = openSearchableListbox(
      <Select searchable value="" onValueChange={() => {}} placeholder="请选择">
        {OPTIONS}
      </Select>,
    )
    expect(listbox).toHaveClass(
      'max-md:max-h-72',
      'md:max-h-[min(18rem,var(--radix-popover-content-available-height,18rem))]',
      'overflow-y-auto',
    )
  })
})
