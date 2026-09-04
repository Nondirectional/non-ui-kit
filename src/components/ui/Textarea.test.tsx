import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Textarea } from './Textarea'

describe('Textarea 封装', () => {
  it('placeholder 透传', () => {
    render(<Textarea placeholder="填写进展备注" />)
    expect(screen.getByPlaceholderText('填写进展备注')).toBeInTheDocument()
  })

  it('ref 转发到原生 textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    const { container } = render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(ref.current).toBe(container.querySelector('textarea'))
  })

  it('className 追加且不丢基础类串（resize-none / leading-relaxed）', () => {
    render(<Textarea className="min-h-24" placeholder="备注" />)
    const textarea = screen.getByPlaceholderText('备注')
    expect(textarea).toHaveClass('min-h-24')
    expect(textarea).toHaveClass('resize-none', 'leading-relaxed', 'bg-surface', 'text-sm')
  })
})
