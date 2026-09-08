import { forwardRef } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../../cn'

/**
 * 设置项开关（Radix Switch 薄封装）：受控 checked + onCheckedChange，
 * aria-label 透传给根 button（role="switch" / aria-checked 由 Radix 维护）。
 * 轨道 36×20px、滑块 16px、四周 2px 边距（h-5 w-9 p-0.5 + translate-x-4
 * 恰好左右对称）；选中态 accent 实心轨道，未选 border-strong + surface-hover。
 * 标题+说明+开关的设置行布局由消费方组织（开关只管右端控件本体）。
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchPrimitive.SwitchProps>(
  function Switch({ className, ...rest }, ref) {
    return (
      <SwitchPrimitive.Root
        ref={ref}
        className={cn(
          'inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border-strong bg-surface-hover p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent',
          className,
        )}
        {...rest}
      >
        <SwitchPrimitive.Thumb className="pointer-events-none block size-4 rounded-full bg-fg shadow transition-transform duration-200 data-[state=checked]:translate-x-4" />
      </SwitchPrimitive.Root>
    )
  },
)
