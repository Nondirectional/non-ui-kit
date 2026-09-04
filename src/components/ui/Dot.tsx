/**
 * 纯视觉小红点（菜单项待办/新内容提示）：8px 危险色圆点，无数字
 * （铃铛已有数字角标，菜单红点避免信息重复）。
 * 状态不得只靠颜色区分：圆点 aria-hidden，语义由 sr-only 文案承载
 * （屏幕阅读器可读，兼作 E2E 文本定位锚点）。
 */
export function Dot({ label }: { label: string }) {
  return (
    <>
      {/* inline-block：尺寸不依赖放置上下文（flex 容器外的普通 span 里 inline 元素 width/height 不生效，会塌缩成 0×0） */}
      <span aria-hidden className="inline-block size-2 shrink-0 rounded-full bg-danger" />
      <span className="sr-only">{label}</span>
    </>
  )
}
