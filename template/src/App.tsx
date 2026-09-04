import { Dot, IconBoard, IconChart, IconInbox, IconMessage } from '@non/ui'
import { cn } from '@non/ui'
import { ComponentDemo } from './demo/ComponentDemo'
import { ThemeToggle } from './demo/ThemeToggle'

const NAV = [
  { label: '总览', icon: IconBoard, active: true },
  { label: '收件箱', icon: IconInbox, dot: true },
  { label: '消息', icon: IconMessage },
  { label: '统计', icon: IconChart },
]

/**
 * 最小布局骨架：侧栏 + 顶栏 + 滚动内容区，全部消费语义令牌（bg-sidebar /
 * bg-surface / border-border …），明暗两套主题自动适配，组件零 dark: 变体。
 * 视口高度链：根 grid 钉住行高（minmax(0,1fr)），内容区 flex-1 min-h-0 才能内部滚动。
 */
export default function App() {
  return (
    <div className="grid h-screen grid-cols-[224px_1fr] grid-rows-[minmax(0,1fr)] overflow-hidden bg-bg text-fg">
      <aside className="flex min-h-0 flex-col border-r border-border bg-sidebar">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="grid size-6 place-items-center rounded-sm bg-accent text-xs font-semibold text-accent-fg">
            N
          </span>
          <span className="text-sm font-semibold">non-starter</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {NAV.map(({ label, icon: Icon, active, dot }) => (
            <button
              key={label}
              type="button"
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                active
                  ? 'bg-surface font-medium text-fg shadow-sm'
                  : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
              )}
            >
              <Icon size={15} />
              {label}
              {dot && <Dot label="有未读" />}
            </button>
          ))}
        </nav>
        <div className="shrink-0 border-t border-border p-3 text-xs text-fg-subtle">
          @non/ui starter
        </div>
      </aside>

      <div className="flex min-h-0 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
          <h1 className="text-base font-semibold">组件速览</h1>
          <ThemeToggle />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-6">
            <ComponentDemo />
          </div>
        </main>
      </div>
    </div>
  )
}
