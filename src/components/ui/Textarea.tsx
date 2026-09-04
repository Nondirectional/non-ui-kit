import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '../../cn'

/** 文本域基础类串：同 Input + resize-none leading-relaxed；min-h 等由消费者按场景追加。 */
const TEXTAREA_CLASS =
  'w-full resize-none rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-relaxed text-fg placeholder:text-fg-subtle transition-colors focus:border-accent focus:outline-none disabled:opacity-50'

/** dense 变体：同基础串但去掉 leading-relaxed（行高回落 text-sm 默认 20px，与 Input 一致），
 * 供「单行起步、自适应长高」的输入框用——首行高度才能与 h-9 按钮行精确对齐。 */
const TEXTAREA_DENSE_CLASS =
  'w-full resize-none rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-accent focus:outline-none disabled:opacity-50'

/** 原生 textarea 薄封装：forwardRef + className 追加（经 cn），其余属性原样透传。 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { dense?: boolean }>(
  function Textarea({ className, dense = false, ...rest }, ref) {
    return <textarea ref={ref} className={cn(dense ? TEXTAREA_DENSE_CLASS : TEXTAREA_CLASS, className)} {...rest} />
  },
)
