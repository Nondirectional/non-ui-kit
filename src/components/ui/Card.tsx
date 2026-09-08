import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** highlight：accent 左边框强调（焦点/汇总卡）；默认普通描边卡 */
  variant?: 'default' | 'highlight'
}

/**
 * 变体完整类串查表（互斥完整串）。border-l-2 与 border 同串并写是 Tailwind
 * 官方支持的「单侧加强」组合（longhand 类在样式表中排序晚于 shorthand）。
 */
const VARIANT_CLASSES = {
  default: 'rounded-md border border-border bg-surface shadow-sm',
  highlight: 'rounded-md border border-border border-l-2 border-l-accent bg-surface shadow-sm',
} as const

/**
 * 卡片容器：KPI 卡与面板的统一皮肤。配方归拢自消费方存量手写卡片
 * （`rounded-md border border-border bg-surface p-4 shadow-sm` 在 work-dispatcher
 * 出现 3+ 次）。基类不带内距——结构化面板用 Header/Content/Footer 子组件各带的
 * p-4；无头部的简单 KPI 卡直接 className="p-4" 追加（基类无 padding，零冲突）。
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(VARIANT_CLASSES[variant], className)} {...rest} />
  )
})

/**
 * 面板头：标题块与右侧动作区两端对齐（看板场景右侧常挂 Tabs / 筛选控件）。
 * 标题+描述双行时左侧自行包一层 flex flex-col（布局类，追加即可）：
 * <CardHeader>
 *   <div className="flex flex-col gap-0.5"><CardTitle/><CardDescription/></div>
 *   <Tabs/>
 * </CardHeader>
 */
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-3 p-4 pb-3', className)}
        {...rest}
      />
    )
  },
)

/** 卡片标题（h3 小标题，对齐消费方 `text-xs font-semibold text-fg-muted` 惯用法，稍升为 fg 提高面板标题层级） */
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...rest }, ref) {
    return <h3 ref={ref} className={cn('text-sm font-semibold text-fg', className)} {...rest} />
  },
)

/** 标题下方的辅助说明（时间范围、口径备注等） */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...rest }, ref) {
  return <p ref={ref} className={cn('text-xs text-fg-muted', className)} {...rest} />
})

/** 面板主体 */
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...rest }, ref) {
    return <div ref={ref} className={cn('p-4 pt-0', className)} {...rest} />
  },
)

/** 面板底部操作行（与 CardContent 同用时会并到同一纵向间距，追加 mt 类调整） */
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 p-4 pt-0', className)}
        {...rest}
      />
    )
  },
)
