import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input 封装', () => {
  it('placeholder 透传', () => {
    render(<Input placeholder="请输入名称" />)
    expect(screen.getByPlaceholderText('请输入名称')).toBeInTheDocument()
  })

  it('ref 转发到原生 input', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toBe(container.querySelector('input'))
  })

  it('className 追加且不丢基础类串', () => {
    render(<Input className="w-32" placeholder="名称" />)
    const input = screen.getByPlaceholderText('名称')
    expect(input).toHaveClass('w-32')
    expect(input).toHaveClass(
      'w-full',
      'rounded-md',
      'border-border-strong',
      'bg-surface',
      'px-3',
      'py-2',
      'text-sm',
    )
    expect(input.className).toContain('focus:border-accent')
  })
})
