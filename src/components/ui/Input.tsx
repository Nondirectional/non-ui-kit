import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '../../cn'

/** 输入框基础类串（design §2.3）：全仓 input 样式的单一来源，消费者只追加布局类。 */
const INPUT_CLASS =
  'w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-accent focus:outline-none disabled:opacity-50'

/** 原生 input 薄封装：forwardRef + className 追加（经 cn），其余属性原样透传。 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = 'text', ...rest }, ref) {
    return <input ref={ref} type={type} className={cn(INPUT_CLASS, className)} {...rest} />
  },
)
