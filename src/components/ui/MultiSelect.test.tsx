import { useState } from 'react'
import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MultiSelect } from './MultiSelect'

const OPTIONS = [
  { value: '2', label: '张三' },
  { value: '3', label: '李四' },
  { value: '4', label: '王五' },
  { value: '5', label: '赵六' },
]

/** Radix DropdownMenu 的触发器在 pointerdown 时打开（不同于 Radix Select 的 click）；jsdom 模拟左键 pointerdown */
function openMenu(trigger: HTMLElement) {
  fireEvent.pointerDown(trigger, { button: 0 })
}

/** 状态化包装：onValueChange 回写内部 state，模拟真实受控消费方（支持连续勾选） */
function StatefulSelect({
  options = OPTIONS,
  onValueChange,
  searchable,
}: {
  options?: typeof OPTIONS
  onValueChange?: (values: string[]) => void
  searchable?: boolean
}) {
  const [value, setValue] = useState<string[]>([])
  return (
    <MultiSelect
      searchable={searchable}
      options={options}
      value={value}
      onValueChange={(v) => {
        onValueChange?.(v)
        setValue(v)
      }}
    />
  )
}

describe('MultiSelect 封装', () => {
  it('默认渲染：0 选中时触发器显示默认 placeholder「请选择」', () => {
    render(<StatefulSelect />)
    const trigger = screen.getByRole('button', { name: '请选择' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('placeholder / id / aria-label 透传到触发器（label htmlFor / E2E locator 依赖）', () => {
    render(
      <MultiSelect
        id="sf-participants"
        aria-label="参与人"
        placeholder="选择参与人"
        options={OPTIONS}
        value={[]}
        onValueChange={vi.fn()}
      />,
    )
    const trigger = screen.getByLabelText('参与人')
    expect(trigger).toHaveAttribute('id', 'sf-participants')
    expect(trigger).toHaveTextContent('选择参与人')
  })

  it('勾选/取消菜单项触发 onValueChange（值数组正确），勾选后菜单不关闭可连点', () => {
    const onValueChange = vi.fn()
    render(<StatefulSelect onValueChange={onValueChange} />)
    openMenu(screen.getByRole('button', { name: '请选择' }))

    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: '张三' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['2'])
    expect(screen.getByRole('menuitemcheckbox', { name: '张三' })).toHaveAttribute('aria-checked', 'true')

    // 勾选不关闭菜单，可继续勾选
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: '李四' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['2', '3'])
    expect(screen.getByRole('menu')).toBeInTheDocument()

    // 取消勾选
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: '张三' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['3'])
    expect(screen.getByRole('menuitemcheckbox', { name: '张三' })).toHaveAttribute('aria-checked', 'false')
  })

  it('触发器 preview：0 选中 placeholder / ≤maxPreview 顿号连接（按 options 顺序）/ 超出「等 N」', () => {
    const { rerender } = render(
      <MultiSelect options={OPTIONS} value={[]} onValueChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: '请选择' })).toBeInTheDocument()

    // value 写入顺序倒置，preview 仍按 options 顺序；2 ≤ maxPreview(默认 2)，顿号连接
    rerender(<MultiSelect options={OPTIONS} value={['3', '2']} onValueChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '张三、李四' })).toBeInTheDocument()

    // 超出 maxPreview：前 2 个 + 「等 N 项」（默认单位 项）
    rerender(<MultiSelect options={OPTIONS} value={['2', '3', '4', '5']} onValueChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '张三、李四 等 4 项' })).toBeInTheDocument()

    // overflowUnit 自定义单位（参与人场景传「人」）
    rerender(
      <MultiSelect
        options={OPTIONS}
        value={['2', '3', '4', '5']}
        onValueChange={vi.fn()}
        overflowUnit="人"
      />,
    )
    expect(screen.getByRole('button', { name: '张三、李四 等 4 人' })).toBeInTheDocument()
  })

  it('options 为空：弹层内显示 emptyLabel（disabled 项，不可点）', () => {
    const { rerender } = render(
      <MultiSelect options={[]} value={[]} onValueChange={vi.fn()} />,
    )
    openMenu(screen.getByRole('button', { name: '请选择' }))
    expect(screen.getByRole('menuitem', { name: '暂无选项' })).toHaveAttribute('aria-disabled', 'true')

    // 自定义 emptyLabel
    rerender(
      <MultiSelect options={[]} value={[]} onValueChange={vi.fn()} emptyLabel="暂无可选同事" />,
    )
    expect(screen.getByRole('menuitem', { name: '暂无可选同事' })).toBeInTheDocument()
  })

  it('disabled 时触发器禁用，无法打开菜单', () => {
    render(<MultiSelect options={OPTIONS} value={[]} onValueChange={vi.fn()} disabled />)
    const trigger = screen.getByRole('button', { name: '请选择' })
    expect(trigger).toBeDisabled()
    openMenu(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('className 追加布局类且不丢基础视觉类（mt-1 与输入框外观共存）', () => {
    render(<MultiSelect className="mt-1" options={OPTIONS} value={[]} onValueChange={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: '请选择' })
    expect(trigger).toHaveClass('mt-1', 'border-border-strong', 'bg-surface', 'text-sm')
  })

  it('未开启 searchable（默认）：弹层内无搜索框（DropdownMenu 路径渲染不变）', () => {
    render(<StatefulSelect />)
    openMenu(screen.getByRole('button', { name: '请选择' }))
    expect(screen.getByRole('menuitemcheckbox', { name: '张三' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: '搜索' })).not.toBeInTheDocument()
  })
})

/** searchable 分支：Popover 底层 click 打开（不同于 DropdownMenu 的 pointerDown） */
function openSearchableMenu() {
  fireEvent.click(screen.getByRole('button', { name: '请选择' }))
  return screen.getByRole('textbox', { name: '搜索' })
}

describe('MultiSelect searchable 搜索分支', () => {
  it('搜索过滤后连续勾选多项：勾选不关闭菜单、不清搜索词，preview 按 options 顺序回显', () => {
    render(<StatefulSelect searchable />)
    const input = openSearchableMenu()
    fireEvent.change(input, { target: { value: '张' } })
    expect(screen.queryByRole('option', { name: '李四' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: '张三' }))
    const trigger = screen.getByRole('button', { name: '张三' })
    expect(trigger).toHaveTextContent('张三')
    // 勾选后菜单保持打开、搜索词保留（连续筛同类）
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(input).toHaveValue('张')
    // 清空恢复全量后继续勾选第二项，preview 顿号连接
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(screen.getByRole('option', { name: '李四' }))
    expect(trigger).toHaveTextContent('张三、李四')
  })

  it('Enter 勾选当前高亮项且菜单不关闭；再 Enter 取消勾选', () => {
    const onValueChange = vi.fn()
    render(<StatefulSelect searchable onValueChange={onValueChange} />)
    const input = openSearchableMenu()
    fireEvent.change(input, { target: { value: '李' } }) // 只剩李四，高亮即首项
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenLastCalledWith(['3'])
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '李四' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it('Space 勾选高亮项且不向搜索框落入空格', () => {
    const onValueChange = vi.fn()
    render(<StatefulSelect searchable onValueChange={onValueChange} />)
    const input = openSearchableMenu()
    fireEvent.keyDown(input, { key: ' ' })
    expect(onValueChange).toHaveBeenLastCalledWith(['2']) // 首项张三
    expect(input).toHaveValue('')
  })

  it('过滤无匹配：显示「无匹配选项」空态行，不占用 option role', () => {
    render(<StatefulSelect searchable />)
    const input = openSearchableMenu()
    fireEvent.change(input, { target: { value: '不存在的人' } })
    expect(screen.getByText('无匹配选项')).toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('options 为空：显示 emptyLabel 空态（与现有语义一致）', () => {
    render(<StatefulSelect searchable options={[]} />)
    openSearchableMenu()
    expect(screen.getByText('暂无选项')).toBeInTheDocument()
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('Esc 关闭后重新打开：搜索词已清空、选项恢复全量', () => {
    render(<StatefulSelect searchable />)
    const input = openSearchableMenu()
    fireEvent.change(input, { target: { value: '王' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    const reopened = openSearchableMenu()
    expect(reopened).toHaveValue('')
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('searchable 触发器契约同形：id / aria-label / 布局类追加、aria-haspopup 指向 listbox', () => {
    render(
      <MultiSelect
        searchable
        id="ms1"
        aria-label="参与人"
        className="mt-1"
        options={OPTIONS}
        value={[]}
        onValueChange={vi.fn()}
      />,
    )
    const trigger = screen.getByLabelText('参与人')
    expect(trigger).toHaveAttribute('id', 'ms1')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('data-placeholder', '')
    expect(trigger).toHaveClass('mt-1', 'w-full', 'border-border-strong')
  })
})

// 08-25-select-scroll-lock：Popover 非 modal 无内建滚动锁，RemoveScroll 包裹补齐
describe('MultiSelect 滚动锁与限高（08-25-select-scroll-lock）', () => {
  it('searchable 弹层打开期间 body 滚动被锁，关闭后恢复', () => {
    expect(getComputedStyle(document.body).overflow).not.toBe('hidden')
    render(<StatefulSelect searchable />)
    const input = openSearchableMenu()
    expect(getComputedStyle(document.body).overflow).toBe('hidden')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(getComputedStyle(document.body).overflow).not.toBe('hidden')
  })

  it('searchable listbox 限高类串防漂移：桌面 min(288px, popover 可用高度) / 移动固定 288px', () => {
    render(<StatefulSelect searchable />)
    openSearchableMenu()
    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveClass(
      'max-md:max-h-72',
      'md:max-h-[min(18rem,var(--radix-popover-content-available-height,18rem))]',
      'overflow-y-auto',
    )
  })

  it('DropdownMenu 路径 Content 限高类串防漂移（桌面自适应 / 移动固定）', () => {
    render(<StatefulSelect />)
    openMenu(screen.getByRole('button', { name: '请选择' }))
    const menu = screen.getByRole('menu')
    expect(menu).toHaveClass(
      'max-md:max-h-72',
      'md:max-h-[min(18rem,var(--radix-dropdown-menu-content-available-height,18rem))]',
      'overflow-y-auto',
    )
  })
})
