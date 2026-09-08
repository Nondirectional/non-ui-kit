import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card'
import { renderInTheme } from '../../test/theme'

describe('Card 容器', () => {
  it('默认变体：rounded-md 描边 + surface 底 + 浅投影（存量手写卡片配方）', () => {
    const { container } = render(<Card />)
    expect(container.firstChild).toHaveClass(
      'rounded-md',
      'border',
      'border-border',
      'bg-surface',
      'shadow-sm',
    )
    expect(container.firstChild).not.toHaveClass('border-l-accent')
  })

  it('highlight 变体：accent 左边框强调（焦点/汇总卡）', () => {
    const { container } = render(<Card variant="highlight" />)
    expect(container.firstChild).toHaveClass('border-l-2', 'border-l-accent', 'bg-surface')
  })

  it('KPI 用法：className="p-4" 追加内距，基类零冲突保留', () => {
    const { container } = render(<Card className="p-4" />)
    expect(container.firstChild).toHaveClass('p-4', 'rounded-md', 'bg-surface')
  })
})

describe('Card 子组件结构', () => {
  it('Header 两端对齐 + Title(h3)/Description(p)/Content/Footer 各带内距', () => {
    const { container, getByText } = render(
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-0.5">
            <CardTitle>请求量</CardTitle>
            <CardDescription>近 24 小时</CardDescription>
          </div>
        </CardHeader>
        <CardContent>1,284</CardContent>
        <CardFooter>footer</CardFooter>
      </Card>,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.children[0]).toHaveClass('flex', 'justify-between', 'gap-3', 'p-4', 'pb-3')
    expect(container.querySelector('h3')).toHaveClass('text-sm', 'font-semibold', 'text-fg')
    expect(container.querySelector('p')).toHaveClass('text-xs', 'text-fg-muted')
    expect(getByText('1,284')).toHaveClass('p-4', 'pt-0')
    expect(getByText('footer')).toHaveClass('flex', 'items-center', 'gap-2')
  })

  it('className 追加透传到各子组件', () => {
    const { container } = render(<CardHeader className="mt-2" />)
    expect(container.firstChild).toHaveClass('mt-2', 'flex')
  })
})

describe('Card 主题契约', () => {
  it('暗色容器下类串与亮色逐字一致（无 dark: 分支）', () => {
    const light = render(<Card />)
    const dark = renderInTheme(<Card />, 'dark')
    expect((dark.container.firstChild as HTMLElement).firstElementChild!.className).toBe(
      (light.container.firstChild as HTMLElement).className,
    )
  })
})
