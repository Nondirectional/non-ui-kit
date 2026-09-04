import { ComponentProps } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { vi } from 'vitest'
import { Button } from './Button'

function renderButton(props: ComponentProps<typeof Button> = {}) {
  return render(<Button {...props}>保存</Button>).getByRole('button')
}

describe('Button 五变体类串', () => {
  it('primary：bg-accent 实心主按钮', () => {
    const btn = renderButton({ variant: 'primary' })
    expect(btn).toHaveClass('bg-accent', 'text-accent-fg', 'rounded-md', 'font-medium', 'px-4')
  })

  it('secondary 为默认变体：描边 + hover 换底换字色', () => {
    const btn = renderButton()
    expect(btn).toHaveClass('border', 'border-border-strong', 'text-fg-muted')
    expect(btn.className).toContain('hover:bg-surface-hover')
    expect(btn.className).toContain('hover:text-fg')
    expect(btn).not.toHaveClass('bg-accent')
  })

  it('ghost：无底色无描边的小操作按钮', () => {
    const btn = renderButton({ variant: 'ghost' })
    expect(btn).toHaveClass('text-fg-muted', 'px-3', 'py-1.5', 'text-xs')
    expect(btn).not.toHaveClass('border')
    expect(btn).not.toHaveClass('bg-accent')
  })

  it('danger-text：红字 + soft 底 hover', () => {
    const btn = renderButton({ variant: 'danger-text' })
    expect(btn).toHaveClass('text-danger')
    expect(btn.className).toContain('hover:bg-danger-soft')
    expect(btn).not.toHaveClass('bg-danger')
  })

  it('danger-solid：bg-danger 实心危险按钮', () => {
    const btn = renderButton({ variant: 'danger-solid' })
    expect(btn).toHaveClass('bg-danger', 'text-danger-fg', 'font-medium')
  })
})

describe('Button 尺寸', () => {
  it('md 默认：px-4 py-2 text-sm', () => {
    const btn = renderButton({ variant: 'primary' })
    expect(btn).toHaveClass('px-4', 'py-2', 'text-sm')
  })

  it('sm：整体换用 px-2.5 py-1.5 text-xs，不残留 md 内距/字号', () => {
    const btn = renderButton({ variant: 'primary', size: 'sm' })
    expect(btn).toHaveClass('px-2.5', 'py-1.5', 'text-xs')
    expect(btn).not.toHaveClass('px-4')
    expect(btn).not.toHaveClass('text-sm')
  })
})

describe('Button 交互与透传', () => {
  it('click 回调透传', () => {
    const onClick = vi.fn()
    fireEvent.click(renderButton({ onClick }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('原生属性透传（type / aria / className 追加不丢基础类）', () => {
    const btn = renderButton({ type: 'submit', 'aria-label': '提交表单', className: 'w-full' })
    expect(btn).toHaveAttribute('type', 'submit')
    expect(btn).toHaveAttribute('aria-label', '提交表单')
    expect(btn).toHaveClass('w-full')
    expect(btn).toHaveClass('rounded-md')
  })
})

describe('Button loading', () => {
  it('loading 强制 disabled 并渲染 spinner，文案不变', () => {
    const btn = renderButton({ loading: true })
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('保存')
    expect(btn.querySelector('span[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('disabled 透传同样生效；loading=false 恢复可点', () => {
    const { rerender, getByRole } = render(<Button disabled>保存</Button>)
    expect(getByRole('button')).toBeDisabled()
    rerender(<Button loading>保存</Button>)
    expect(getByRole('button')).toBeDisabled()
    rerender(<Button>保存</Button>)
    expect(getByRole('button')).toBeEnabled()
  })
})

describe('Button 移动端触控下限（08-20-mobile-h5-core-pages）', () => {
  it('md 尺寸在移动端（max-md）至少 44px 高（AC4 主操作触控目标）', () => {
    const btn = render(<Button variant="primary">保存</Button>).getByRole('button')
    expect(btn).toHaveClass('max-md:min-h-11')
  })

  it('sm 尺寸是行内紧凑操作，不放大（保持行内密度）', () => {
    const btn = render(<Button size="sm">取消</Button>).getByRole('button')
    expect(btn).not.toHaveClass('max-md:min-h-11')
  })
})
