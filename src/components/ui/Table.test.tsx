import { ComponentProps, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableSort,
} from './Table'
import { renderInTheme } from '../../test/theme'

const ROWS = [
  { model: 'glm-4.7', status: '运行中', calls: 1200 },
  { model: 'glm-4.6', status: '已下线', calls: 800 },
]

/** 排行表典型形态：模型列（文本）+ 状态列（不可排）+ 调用次数列（数值） */
function renderTable(props: Partial<ComponentProps<typeof Table>> = {}) {
  return render(
    <Table {...props}>
      <TableHeader>
        <TableRow>
          <TableHead sortKey="model">模型</TableHead>
          <TableHead>状态</TableHead>
          <TableHead sortKey="calls">调用次数</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((r) => (
          <TableRow key={r.model}>
            <TableCell>{r.model}</TableCell>
            <TableCell>{r.status}</TableCell>
            <TableCell className="text-right tabular-nums">{r.calls}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>,
  )
}

describe('Table 结构', () => {
  it('原生语义渲染：columnheader ×3 + 数据行 ×2，外层横向滚动容器', () => {
    const { container } = renderTable()
    expect(container.querySelector('div.overflow-x-auto > table')).not.toBeNull()
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    ROWS.forEach((r) => expect(screen.getByText(r.model)).toBeInTheDocument())
    expect(screen.getByText('1200')).toHaveClass('text-right', 'tabular-nums', 'px-3', 'py-2')
  })

  it('行分割线 + hover 换底（last:border-b-0 收尾）', () => {
    renderTable()
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveClass('border-b', 'hover:bg-surface-hover', 'last:border-b-0')
    expect(rows[1]).toHaveClass('border-border')
  })
})

describe('Table 排序（未接受控时退化为纯文本）', () => {
  it('不传 sort/onSortChange：sortKey 表头无 button、无 aria-sort', () => {
    renderTable()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('columnheader', { name: '调用次数' })).not.toHaveAttribute(
      'aria-sort',
    )
  })
})

describe('Table 排序交互（sort + onSortChange 受控）', () => {
  it('激活列带 aria-sort 与方向指示（desc：chevron 朝下不旋转）', () => {
    renderTable({ sort: { key: 'calls', direction: 'desc' }, onSortChange: vi.fn() })
    const calls = screen.getByRole('columnheader', { name: /调用次数/ })
    expect(calls).toHaveAttribute('aria-sort', 'descending')
    const icon = calls.querySelector('svg')!
    expect(icon).toHaveClass('opacity-100')
    expect(icon).not.toHaveClass('rotate-180')
    expect(screen.getByRole('columnheader', { name: '状态' })).not.toHaveAttribute('aria-sort')
  })

  it('asc 方向：aria-sort=ascending + chevron rotate-180 朝上', () => {
    renderTable({ sort: { key: 'model', direction: 'asc' }, onSortChange: vi.fn() })
    const model = screen.getByRole('columnheader', { name: /模型/ })
    expect(model).toHaveAttribute('aria-sort', 'ascending')
    expect(model.querySelector('svg')).toHaveClass('rotate-180')
  })

  it('点击新列 → onValue 语义：onSortChange(该列, 默认 desc)', () => {
    const onSortChange = vi.fn()
    renderTable({ sort: { key: 'calls', direction: 'desc' }, onSortChange })
    fireEvent.click(screen.getByRole('button', { name: /模型/ }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'model', direction: 'desc' })
  })

  it('initialDirection="asc" 的列首次点击从升序开始（文本列）', () => {
    const onSortChange = vi.fn()
    render(
      <Table sort={null} onSortChange={onSortChange}>
        <TableHeader>
          <TableRow>
            <TableHead sortKey="name" initialDirection="asc">
              名称
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    fireEvent.click(screen.getByRole('button', { name: /名称/ }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' })
  })

  it('点击当前列 → 翻转方向', () => {
    const onSortChange = vi.fn()
    renderTable({ sort: { key: 'calls', direction: 'desc' }, onSortChange })
    fireEvent.click(screen.getByRole('button', { name: /调用次数/ }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'calls', direction: 'asc' })
  })

  it('受控接线闭环：消费方依回调更新 sort，aria-sort 跟随翻转', () => {
    function SortableTable() {
      const [sort, setSort] = useState<TableSort>({ key: 'calls', direction: 'desc' })
      return (
        <Table sort={sort} onSortChange={setSort}>
          <TableHeader>
            <TableRow>
              <TableHead sortKey="calls">调用次数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{ROWS[0].calls}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
    }
    const { unmount } = render(<SortableTable />)
    const head = screen.getByRole('columnheader', { name: /调用次数/ })
    expect(head).toHaveAttribute('aria-sort', 'descending')
    fireEvent.click(screen.getByRole('button', { name: /调用次数/ }))
    expect(head).toHaveAttribute('aria-sort', 'ascending')
    unmount()
  })
})

describe('Table 主题契约', () => {
  it('暗色容器下排序交互行为与表头类串不变（无 dark: 分支）', () => {
    const onSortChange = vi.fn()
    const dark = renderInTheme(
      <Table sort={null} onSortChange={onSortChange}>
        <TableHeader>
          <TableRow>
            <TableHead sortKey="calls">调用次数</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1200</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
      'dark',
    )
    const head = dark.getByRole('columnheader')
    expect(head.className).not.toMatch(/dark:/)
    expect(head).toHaveClass('text-fg-muted', 'border-border')
    fireEvent.click(dark.getByRole('button', { name: /调用次数/ }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'calls', direction: 'desc' })
  })
})
