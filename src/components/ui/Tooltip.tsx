import type { ReactElement, ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

/**
 * 全局 Tooltip Provider（08-19-replace-native-ui 决策 D1）：Radix 要求根
 * Provider，delayDuration 300ms 统一悬停延迟；挂在 App 顶层（紧邻 Router）。
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={300}>{children}</TooltipPrimitive.Provider>
}

interface TooltipProps {
  /** 提示文案；为空（undefined / ''）时不挂 tooltip，children 原样渲染——承接旧 title={cond ? '…' : undefined} 的条件写法 */
  label?: string
  /** 触发元素：asChild 包裹，原有 aria-label / className / onClick 等全部保留 */
  children: ReactElement
  /** 弹出方位，默认 top */
  side?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * 全站唯一样式提示气泡：反色小气泡（bg-fg text-bg，token 互换即双主题自适应：
 * 浅色主题深底浅字、深色主题浅底深字），z-[70] 高于 dialog z-50 与 toast z-[60]。
 * 悬停 / 键盘聚焦触发器时显示，radix 自动建立 aria-describedby 关联。
 */
export function Tooltip({ label, children, side = 'top' }: TooltipProps) {
  if (!label) return children
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          collisionPadding={8}
          className="z-[70] max-w-64 select-none rounded-md bg-fg px-2 py-1 text-left text-xs text-bg shadow-lg animate-[tooltip-in_100ms_ease-out]"
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
