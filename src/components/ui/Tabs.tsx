import { forwardRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../cn'

/**
 * 选项卡（Radix Tabs 薄封装）：受控 value + onValueChange（不传 value 时
 * Radix 原生支持 defaultValue 非受控）。看板典型用法是图表粒度切换
 * （小时/天/周/月），激活方向键漫游 / roving tabindex 由 Radix 内建。
 * Root 无样式，此处薄包一层仅为统一 forwardRef 形态与 JSDoc。
 */
export const Tabs = forwardRef<HTMLDivElement, TabsPrimitive.TabsProps>(function Tabs(
  { ...rest },
  ref,
) {
  return <TabsPrimitive.Root ref={ref} {...rest} />
})

/**
 * 分段控件容器：内凹一层底（bg-sidebar 比 surface 卡片底深一档，形成
 * 「页面底 → 卡片底 → 控件底」三级层次），内含 Trigger 胶囊。
 */
export const TabsList = forwardRef<HTMLDivElement, TabsPrimitive.TabsListProps>(
  function TabsList({ className, ...rest }, ref) {
    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md border border-border bg-sidebar p-0.5',
          className,
        )}
        {...rest}
      />
    )
  },
)

/**
 * 单个选项：未选 fg-muted 悬停加深，选中 accent 实心胶囊（accent-fg 反白字）。
 * hover 变体限定 data-[state=inactive]，避免与选中态 text-accent-fg 同族冲突
 * （本库无 tailwind-merge，同类冲突胜者由样式表顺序决定、不可预测）。
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsPrimitive.TabsTriggerProps>(
  function TabsTrigger({ className, ...rest }, ref) {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-sm px-3 py-1 text-xs font-medium text-fg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:pointer-events-none disabled:opacity-50 data-[state=inactive]:hover:text-fg data-[state=active]:bg-accent data-[state=active]:text-accent-fg',
          className,
        )}
        {...rest}
      />
    )
  },
)

/** 面板内容：仅保留焦点轮廓，与 TabsList 的间距由消费方按场景追加（mt-*） */
export const TabsContent = forwardRef<HTMLDivElement, TabsPrimitive.TabsContentProps>(
  function TabsContent({ className, ...rest }, ref) {
    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn('focus-visible:outline-none', className)}
        {...rest}
      />
    )
  },
)
