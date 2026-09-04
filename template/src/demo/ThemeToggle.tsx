import { IconMoon, IconSun } from '@non/ui'
import { cn, useTheme, type ThemeSetting } from '@non/ui'

const OPTIONS: { value: ThemeSetting; label: string; icon: typeof IconSun | null }[] = [
  { value: 'light', label: '浅色', icon: IconSun },
  { value: 'dark', label: '深色', icon: IconMoon },
  { value: 'system', label: '系统', icon: null },
]

/**
 * 主题三档切换（明暗演示入口）：useTheme 的 setTheme 同步写 localStorage[key]
 * 并立即切换 <html>.dark，刷新后由 index.html 的 FOUC 脚本还原，不闪白。
 * 图标按钮/分段控件不走 Button（组件规范：icon-only 控件保持手写标记）。
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="主题切换"
      className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1 text-xs transition-colors',
            theme === value
              ? 'bg-accent-soft font-medium text-accent'
              : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
          )}
        >
          {Icon && <Icon size={13} />}
          {label}
        </button>
      ))}
    </div>
  )
}
