import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger-text' | 'danger-solid'
export type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 视觉变体，默认 secondary */
  variant?: ButtonVariant
  /** 尺寸，默认 md；sm = px-2.5 py-1.5 text-xs（整体换用，非叠加） */
  size?: ButtonSize
  /** true 时强制 disabled 并渲染内联 spinner，文案不变 */
  loading?: boolean
}

/**
 * 变体 × size 完整类串查表（design §2.2 配方）。
 * 没有 tailwind-merge：每条都是完整串，一次只取一条，杜绝同类冲突；
 * 调用方只允许经 className 追加布局类（w-full / flex-1 等）。
 */
const VARIANT_CLASSES: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: {
    md: 'rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:pointer-events-none disabled:opacity-50',
    sm: 'rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:pointer-events-none disabled:opacity-50',
  },
  secondary: {
    md: 'rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:pointer-events-none disabled:opacity-50',
    sm: 'rounded-md border border-border-strong px-2.5 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:pointer-events-none disabled:opacity-50',
  },
  ghost: {
    md: 'rounded-md px-3 py-1.5 text-xs text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg',
    sm: 'rounded-md px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg',
  },
  'danger-text': {
    md: 'rounded-md px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger-soft',
    sm: 'rounded-md px-2.5 py-1.5 text-xs text-danger transition-colors hover:bg-danger-soft',
  },
  'danger-solid': {
    md: 'rounded-md bg-danger px-4 py-2 text-sm font-medium text-danger-fg transition-colors hover:brightness-110 disabled:pointer-events-none disabled:opacity-50',
    sm: 'rounded-md bg-danger px-2.5 py-1.5 text-xs font-medium text-danger-fg transition-colors hover:brightness-110 disabled:pointer-events-none disabled:opacity-50',
  },
}

/** 全站统一按钮：五变体 × 两尺寸查表出类，样式单一来源（M2 起全仓按钮迁入）。 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        VARIANT_CLASSES[variant][size],
        // 移动端主操作触控下限 44px（AC4）；sm 是行内紧凑操作，不放大
        size === 'md' && 'max-md:min-h-11',
        className,
      )}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className={cn(
            'mr-1.5 inline-block animate-spin rounded-full border-2 border-fg-subtle border-t-transparent align-[-2px]',
            size === 'sm' ? 'size-3' : 'size-3.5',
          )}
        />
      )}
      {children}
    </button>
  )
})
