import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'

// useTheme 模块顶层就执行 getStore()（读 localStorage + 切 html.dark）+ matchMedia().addEventListener，
// 而 jsdom 没有 matchMedia：必须先 stubGlobal 再动态 import（stub 后才加载模块）。
// 模块级 store 按 key 存 Map，每个用例 resetModules 重新加载 + localStorage 清理，互不污染。

let media: {
  matches: boolean
  addEventListener: (type: string, cb: () => void) => void
  removeEventListener: (type: string, cb: () => void) => void
}
let changeListeners: Set<() => void>

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  changeListeners = new Set()
  media = {
    matches: false,
    addEventListener: (_type, cb) => changeListeners.add(cb),
    removeEventListener: (_type, cb) => changeListeners.delete(cb),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => media))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useTheme 初始读取', () => {
  it('无存储时回退 system 并解析为浅色', async () => {
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('存储非法值时回退 system', async () => {
    localStorage.setItem('theme', 'blue')
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
  })

  it('system 模式跟随系统深色偏好', async () => {
    media.matches = true
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

describe('setTheme', () => {
  it('setTheme(dark) 立即切换 html.dark、写入存储并更新快照', async () => {
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('setTheme(light) 移除 html.dark（双向切换）', async () => {
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    act(() => result.current.setTheme('light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
    expect(result.current.theme).toBe('light')
  })
})

describe('自定义 storage key（包参数化新增）', () => {
  it('自定义 key 有存储值时按其初始化', async () => {
    localStorage.setItem('my-app:theme', 'dark')
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme('my-app:theme'))
    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('自定义 key 的 setTheme 只写自己的存储位，不影响默认 key', async () => {
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme('my-app:theme'))
    act(() => result.current.setTheme('dark'))
    expect(localStorage.getItem('my-app:theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe(null)
    expect(result.current.theme).toBe('dark')
  })

  it('独立 useTheme 导出的 setTheme 接受显式 key', async () => {
    const { setTheme, useTheme } = await import('./useTheme')
    setTheme('dark', 'another:theme')
    const { result } = renderHook(() => useTheme('another:theme'))
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

describe('系统外观变化订阅', () => {
  it('system 模式下系统切深色，订阅者收到通知并实时生效', async () => {
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())
    expect(result.current.resolvedTheme).toBe('light')
    media.matches = true
    // 模块顶层注册的 change listener 被我们的 stub 收集，手动触发即模拟 OS 外观变化
    act(() => changeListeners.forEach((l) => l()))
    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('显式指定主题时系统外观变化不生效', async () => {
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('light'))
    media.matches = true
    act(() => changeListeners.forEach((l) => l()))
    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
