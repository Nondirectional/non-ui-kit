import { forwardRef } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { IconCheck } from '../../icons'
import { cn } from '../../cn'

/**
 * 复选框（Radix Checkbox 薄封装）：语义为「表单里填完统一提交的是/否选择」，
 * 与 Switch（立即生效的设置开关）区分。受控 checked + onCheckedChange 直接
 * 沿用 Radix 原生签名（含 'indeterminate'），不做值收敛。
 * 16px 方块、4px 圆角（与 RadioGroupItem 尺寸对齐；6px 圆角在 16px 上过圆，
 * 不像复选框）；未选 border-strong + surface，选中/半选 accent 实心 +
 * accent-fg 勾/横线。文本 label 由消费方以 label[htmlFor] 组合，kit 只提供
 * 方块本体（同 Switch / RadioGroup 哲学）。
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxPrimitive.CheckboxProps>(
  function Checkbox({ className, checked, ...rest }, ref) {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border-strong bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent',
          className,
        )}
        {...rest}
      >
        <CheckboxPrimitive.Indicator className="text-accent-fg">
          {checked === 'indeterminate' ? (
            <span className="block h-0.5 w-2 rounded-full bg-accent-fg" />
          ) : (
            <IconCheck size={12} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )
  },
)
