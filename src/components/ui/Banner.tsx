import type { HTMLAttributes, ReactNode } from 'react'
import { IconAlertTriangle, IconInfo, IconX } from '../../icons'
import { cn } from '../../cn'

export type BannerTone = 'info' | 'warning' | 'danger'

interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /** 语义 tone，默认 info */
  tone?: BannerTone
  children: ReactNode
}

/** tone → soft 底 + 同语义字色 + 前置图标查表（info 用中性呈现，不与三态语义色竞争） */
const TONE_META: Record<BannerTone, { box: string; icon: string; Icon: typeof IconX; role: 'status' | 'alert' }> = {
  info: { box: 'bg-surface-hover text-fg-muted', icon: 'text-fg-subtle', Icon: IconInfo, role: 'status' },
  warning: { box: 'bg-warning-soft text-warning', icon: 'text-warning', Icon: IconAlertTriangle, role: 'alert' },
  danger: { box: 'bg-danger-soft text-danger', icon: 'text-danger', Icon: IconX, role: 'alert' },
}

/**
 * inline 常驻提示条（页面/区块级，与 toast 的瞬时性互补）：soft 底 + 前置
 * 图标，warning/danger 走 role=alert（读屏即时报），info 走 status。
 * children 为正文区（可含段落/<details>/<pre> 等），图标列 items-start 顶部对齐。
 */
export function Banner({ tone = 'info', className, children, ...rest }: BannerProps) {
  const meta = TONE_META[tone]
  return (
    <div
      role={meta.role}
      className={cn('flex items-start gap-2 rounded-md px-3.5 py-2.5 text-sm', meta.box, className)}
      {...rest}
    >
      <span aria-hidden className={cn('mt-0.5 shrink-0', meta.icon)}>
        <meta.Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
