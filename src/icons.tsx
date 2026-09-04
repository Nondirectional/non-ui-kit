import { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

/**
 * 线性描边图标集：stroke 1.4、currentColor 取色，
 * 与 ui-theme.md「Component Conventions」一致。
 */
function icon(path: IconProps['children']) {
  return function Icon({ size = 16, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        {...rest}
      >
        {path}
      </svg>
    )
  }
}

export const IconBoard = icon(
  <>
    <rect x="2.2" y="2.2" width="5.2" height="5.2" rx="1" />
    <rect x="8.6" y="2.2" width="5.2" height="5.2" rx="1" />
    <rect x="2.2" y="8.6" width="5.2" height="5.2" rx="1" />
    <rect x="8.6" y="8.6" width="5.2" height="5.2" rx="1" />
  </>,
)

export const IconUsers = icon(
  <>
    <circle cx="5.6" cy="5.2" r="2.4" />
    <path d="M1.8 13.2c.5-2.5 2-3.8 3.8-3.8s3.3 1.3 3.8 3.8" />
    <circle cx="11.2" cy="5.8" r="1.9" />
    <path d="M11 9.6c1.6 0 2.8 1 3.2 3" />
  </>,
)

export const IconInbox = icon(
  <>
    <path d="M2.5 9.3 4.6 3h6.8l2.1 6.3v3.4a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z" />
    <path d="M2.5 9.3h3l.9 1.6h3.2l.9-1.6h3" />
  </>,
)

export const IconFeedback = icon(
  <>
    <path d="M13.2 8.2c0 2.7-2.3 4.8-5.2 4.8-.6 0-1.2-.1-1.7-.3L3 14l.8-2.4A4.6 4.6 0 0 1 2.8 8.2c0-2.7 2.3-4.8 5.2-4.8s5.2 2.1 5.2 4.8z" />
    <path d="M8 6.2v2.4" />
    <circle cx="8" cy="10.2" r="0.1" />
  </>,
)

export const IconMessage = icon(
  <>
    <path d="M2.5 3.8h11v7.4h-6l-3.3 2.5v-2.5H2.5z" />
    <path d="M5 6.5h6M5 8.7h3.8" />
  </>,
)

export const IconChart = icon(
  <>
    <path d="M3 13.2V8" />
    <path d="M7.4 13.2V3.8" />
    <path d="M11.8 13.2V6" />
  </>,
)

/** 部署请求导航：上传发布语义（分支发布上线） */
export const IconDeploy = icon(
  <>
    <path d="M8 11.5V3.8" />
    <path d="M4.9 6.9 8 3.8l3.1 3.1" />
    <path d="M3 12.6h10" />
  </>,
)

/** 流水线导航（V32 打包编排）：终端提示符语义 */
export const IconPipeline = icon(
  <>
    <rect x="1.8" y="2.8" width="12.4" height="10.4" rx="1.6" />
    <path d="M4.6 6.2 6.4 8 4.6 9.8" />
    <path d="M8 10.2h3.2" />
  </>,
)

export const IconChat = icon(
  <>
    <path d="M2.5 4.2a1.4 1.4 0 0 1 1.4-1.4h8.2a1.4 1.4 0 0 1 1.4 1.4v5.6a1.4 1.4 0 0 1-1.4 1.4H7.2l-3.1 2.5v-2.5a1.6 1.6 0 0 1-1.6-1.6z" />
    <path d="M5.2 6h5.6M5.2 8.4h3.4" />
  </>,
)

export const IconPlus = icon(<path d="M8 3.2v9.6M3.2 8h9.6" />)

export const IconX = icon(<path d="M4 4l8 8M12 4l-8 8" />)

export const IconSliders = icon(
  <>
    <path d="M3 5h10M3 11h10" />
    <circle cx="6.2" cy="5" r="1.7" />
    <circle cx="10" cy="11" r="1.7" />
  </>,
)

/** 部门管理：组织架构图（上级节点连线两个下级节点） */
export const IconDept = icon(
  <>
    <rect x="5.7" y="1.9" width="4.6" height="3.2" rx="0.8" />
    <path d="M8 5.1v2.2M3 7.3h10M4.3 7.3v1.9M11.7 7.3v1.9" />
    <rect x="1.7" y="9.2" width="5.2" height="3.2" rx="0.8" />
    <rect x="9.1" y="9.2" width="5.2" height="3.2" rx="0.8" />
  </>,
)

export const IconUser = icon(
  <>
    <circle cx="8" cy="5.6" r="2.8" />
    <path d="M2.8 13.4c.7-3 2.8-4.6 5.2-4.6s4.5 1.6 5.2 4.6" />
  </>,
)

export const IconSun = icon(
  <>
    <circle cx="8" cy="8" r="2.9" />
    <path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1" />
  </>,
)

export const IconMoon = icon(
  <path d="M13.2 9.7A5.9 5.9 0 0 1 6.3 2.8a5.9 5.9 0 1 0 6.9 6.9z" />,
)

export const IconCheck = icon(<path d="M3.5 8.6l2.9 2.9 6.1-6.9" />)

export const IconChevronLeft = icon(<path d="M9.8 3.8 5.6 8l4.2 4.2" />)

/** Select 触发器右端下拉指示 */
export const IconChevronDown = icon(<path d="M3.8 6.2 8 10.4l4.2-4.2" />)

/** DatePicker / DateTimePicker 触发器右端日历指示 */
export const IconCalendar = icon(
  <>
    <rect x="2.5" y="2.8" width="11" height="11.4" rx="1.4" />
    <path d="M2.5 6.4h11" />
    <path d="M5.4 1.8v2M10.6 1.8v2" />
  </>,
)

export const IconChevronRight = icon(<path d="M6.2 3.8 10.4 8l-4.2 4.2" />)

export const IconKey = icon(
  <>
    <circle cx="5.5" cy="10.5" r="2.6" />
    <path d="M7.4 8.6 13 3M10.8 5.2l1.5 1.5M9.2 6.8l1.5 1.5" />
  </>,
)

export const IconLogout = icon(
  <>
    <path d="M6 13.5H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1H6" />
    <path d="M10.5 11l3-3-3-3M13.5 8H6" />
  </>,
)

export const IconMore = icon(
  <>
    <circle cx="3.1" cy="8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="8" cy="8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="12.9" cy="8" r="0.9" fill="currentColor" stroke="none" />
  </>,
)

export const IconBell = icon(
  <>
    <path d="M4 5.3a4 4 0 0 1 8 0c0 4.7 2 6 2 6H2s2-1.3 2-6" />
    <path d="M6.9 14a1.3 1.3 0 0 0 2.2 0" />
  </>,
)

export const IconDownload = icon(
  <>
    <path d="M6 20h12" />
    <path d="M12 3v12" />
    <path d="m8 11 4 4 4-4" />
    <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
  </>,
)

export const IconSparkle = icon(
  <>
    <path d="M7.4 2.6l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1z" />
    <path d="M12 10.6l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z" />
  </>,
)

/** 使用指南导航：打开的书册语义 */
export const IconBook = icon(
  <>
    <path d="M8 3.9C6.8 2.9 5.1 2.5 3 2.5v9.7c2.1 0 3.8.4 5 1.4 1.2-1 2.9-1.4 5-1.4V2.5c-2.1 0-3.8.4-5 1.4z" />
    <path d="M8 3.9v9.7" />
  </>,
)

/** 更新日志导航：时钟语义 */
export const IconClock = icon(
  <>
    <circle cx="8" cy="8" r="5.6" />
    <path d="M8 4.8V8l2.2 1.4" />
  </>,
)

/** 审计日志导航：盾牌语义（操作留痕与安全审计） */
export const IconShield = icon(
  <path d="M8 1.8l4.6 1.7v3.7c0 3-1.9 5.4-4.6 6.5-2.7-1.1-4.6-3.5-4.6-6.5V3.5z" />,
)
