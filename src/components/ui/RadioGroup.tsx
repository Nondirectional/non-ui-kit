import { forwardRef } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../../cn'

/**
 * 单选组（Radix RadioGroup 薄封装）：受控 value + onValueChange，组内
 * RadioGroupItem 的 value 唯一且非空串。默认纵向堆叠，横向/栅格布局由消费方
 * 以 className 覆盖；选项行（圆圈 + 文本 label 联动）由消费方组合，
 * kit 只提供控件本体（同 Switch 哲学）。
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupPrimitive.RadioGroupProps>(
  function RadioGroup({ className, ...rest }, ref) {
    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn('flex flex-col gap-2', className)}
        {...rest}
      />
    )
  },
)

/**
 * 单选项（须置于 RadioGroup 内）：16px 圆圈，选中态 accent 边框 + 中心 8px
 * 实心圆点（Indicator 仅选中时渲染）。可访问名用 aria-label 或外层
 * label[htmlFor] 指向 item 的 id。
 */
export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupPrimitive.RadioGroupItemProps>(
  function RadioGroupItem({ className, ...rest }, ref) {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent',
          className,
        )}
        {...rest}
      >
        <RadioGroupPrimitive.Indicator className="block size-2 rounded-full bg-accent" />
      </RadioGroupPrimitive.Item>
    )
  },
)
