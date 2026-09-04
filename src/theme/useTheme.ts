import { useSyncExternalStore } from 'react'

export type ThemeSetting = 'light' | 'dark' | 'system'

/**
 * localStorage key 参数化（本包抽离自 work-dispatcher 时新增）：
 * 多应用同域部署时各自传独立 key 避免互相覆盖；默认 'theme'。
 * 注意 <html>.dark 是全局唯一的主题载体——同页面挂多个不同 key 的消费方
 * 会互相顶替类名，参数化针对的是「一域多应用，各占一个页面」的场景。
 */
export const DEFAULT_THEME_STORAGE_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

interface ThemeState {
  theme: ThemeSetting
  resolvedTheme: 'light' | 'dark'
}

function readSetting(key: string): ThemeSetting {
  try {
    const v = localStorage.getItem(key)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    // 隐私模式下 localStorage 抛异常，按 system 处理
  }
  return 'system'
}

function resolve(setting: ThemeSetting): 'light' | 'dark' {
  if (setting === 'system') {
    return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
  }
  return setting
}

function computeState(setting: ThemeSetting): ThemeState {
  const resolvedTheme = resolve(setting)
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  return { theme: setting, resolvedTheme }
}

/** 每个 storage key 一个模块级 store（30 用户量级，无需 React context） */
interface ThemeStore {
  state: ThemeState
  listeners: Set<() => void>
}

const stores = new Map<string, ThemeStore>()

function getStore(key: string): ThemeStore {
  let store = stores.get(key)
  if (!store) {
    store = { state: computeState(readSetting(key)), listeners: new Set() }
    stores.set(key, store)
  }
  return store
}

// 跟随系统时，OS 外观变化要实时生效（无需刷新）。
// 沿用原实现语义：监听器在模块加载时注册一次，非 per-hook 订阅、不退订；
// key 参数化后一个监听器遍历刷新所有 system 态 store。
window.matchMedia(DARK_QUERY).addEventListener('change', () => {
  stores.forEach((store) => {
    if (store.state.theme !== 'system') return
    store.state = computeState('system')
    store.listeners.forEach((l) => l())
  })
})

/** 规范契约：写入 localStorage[key] 并立即切换 <html>.dark */
export function setTheme(theme: ThemeSetting, key = DEFAULT_THEME_STORAGE_KEY): void {
  try {
    localStorage.setItem(key, theme)
  } catch {
    // 写入失败（隐私模式）时本次会话内仍然生效
  }
  const store = getStore(key)
  store.state = computeState(theme)
  store.listeners.forEach((l) => l())
}

/**
 * 主题 hook。`key` 为 localStorage 存储键，默认 'theme'；
 * 返回的 setTheme 已绑定该 key。
 */
export function useTheme(key = DEFAULT_THEME_STORAGE_KEY): ThemeState & {
  setTheme: (theme: ThemeSetting) => void
} {
  const snap = useSyncExternalStore(
    (cb) => {
      const store = getStore(key)
      store.listeners.add(cb)
      return () => {
        store.listeners.delete(cb)
      }
    },
    () => getStore(key).state,
  )
  return { ...snap, setTheme: (theme: ThemeSetting) => setTheme(theme, key) }
}
