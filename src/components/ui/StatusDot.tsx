import { cn } from '../../cn'

export type StatusDotState = 'on' | 'off' | 'unknown'

/**
 * 三态实心/空心查表（互斥完整串）：on 实心 success、off 实心 fg-subtle、
 * unknown 空心（fg-subtle 描边透底）——空心与 off 的实心灰在任意主题下
 * 都可区分，且不占用 warning 语义色。
 */
const STATE_CLASSES: Record<StatusDotState, string> = {
  on: 'bg-success',
  off: 'bg-fg-subtle',
  unknown: 'border border-fg-subtle bg-transparent',
}

/**
 * 三态状态指示点（连通性/健康度）：8px 圆点，on（正常）/ off（明确异常或
 * 关闭）/ unknown（未探测）。与 Dot（危险红点，待办提示）互补，不替代。
 * 状态不得只靠颜色/形态区分：圆点 aria-hidden，语义由 sr-only 文案承载；
 * 视觉悬浮提示由调用方外包 Tooltip（label 同源）。
 */
export function StatusDot({ state, label }: { state: StatusDotState; label: string }) {
  return (
    <>
      <span
        aria-hidden
        className={cn('inline-block size-2 shrink-0 rounded-full', STATE_CLASSES[state])}
      />
      <span className="sr-only">{label}</span>
    </>
  )
}
