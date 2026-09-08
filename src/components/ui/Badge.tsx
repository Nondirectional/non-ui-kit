import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../cn'

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 语义色变体，默认 neutral（模型名等中性标记，不抢数据视觉） */
  variant?: BadgeVariant
  /** 前置状态圆点（aria-hidden，色随字色 bg-current）：LIVE/异常类「圆点+文字」状态行；
   * 语义仍由文案承载，圆点只是视觉强化，不单靠颜色区分状态 */
  dot?: boolean
}

/**
 * 变体完整类串查表（互斥，一次只取一条）：soft 底 + 同语义字色，
 * 明暗两套 token 都有对应 soft 取值，深浅主题免分支。
 */
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-hover text-fg-muted',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

/**
 * 语义色胶囊徽标：模型名 / 状态标记（排行表状态列、面板头部计数等场景）。
 * pill 形态沿用消费方存量手写配方（inline-flex rounded-full px-2 py-0.5 text-xs
 * font-medium，TeamDailySection / UserManagementPage 各自的散装实现归拢于此）。
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'neutral', dot = false, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  )
})
