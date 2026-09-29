import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IconAlertTriangle, IconCheck, IconInfo, IconX } from '../../icons'

type ToastKind = 'error' | 'success' | 'info' | 'warning'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

export interface ToastApi {
  /** 失败提示（role="alert"，danger 语义配色） */
  error: (message: string) => void
  /** 成功提示（role="status"，success 语义配色） */
  success: (message: string) => void
  /** 中性信息提示（role="status"，fg-subtle 描边 + IconInfo）：过程性事件反馈 */
  info: (message: string) => void
  /** 警示提示（role="alert"，warning 语义配色 + IconAlertTriangle）：非失败但需注意 */
  warning: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** 自动消失时长：错误提示留出阅读与重试间隔 */
const TOAST_MS = 3500

/**
 * kind → 视觉与 aria 语义查表：error/warning 是需要注意的结果（alert），
 * success/info 是过程性反馈（status）。图标与描边同语义色；info 无专属
 * 语义色 token，用 fg-subtle 中性呈现，不与三态语义色竞争。
 */
const KIND_META: Record<
  ToastKind,
  { role: 'alert' | 'status'; border: string; icon: string; Icon: typeof IconX }
> = {
  error: { role: 'alert', border: 'border-danger', icon: 'text-danger', Icon: IconX },
  success: { role: 'status', border: 'border-success', icon: 'text-success', Icon: IconCheck },
  info: { role: 'status', border: 'border-fg-subtle', icon: 'text-fg-subtle', Icon: IconInfo },
  warning: { role: 'alert', border: 'border-warning', icon: 'text-warning', Icon: IconAlertTriangle },
}

/**
 * 全局轻量 Toast（08-19-replace-native-ui 决策 A2）：Context 自建零依赖，
 * fixed 顶部居中堆叠、z-[60] 高于 dialog 的 z-50，深浅主题靠语义 token 适配。
 * 每条独立 timer 自动消失（3.5s），点击条目立即关闭（容器 pointer-events-none，
 * 条目自身恢复 pointer-events-auto）；Provider 卸载时统一清理。
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const seqRef = useRef(0)
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++seqRef.current
      setToasts((prev) => [...prev, { id, kind, message }])
      timersRef.current.set(id, setTimeout(() => dismiss(id), TOAST_MS))
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      error: (message) => push('error', message),
      success: (message) => push('success', message),
      info: (message) => push('info', message),
      warning: (message) => push('warning', message),
    }),
    [push],
  )

  // 卸载清理：避免残留 timer 在测试/路由切换后 setState
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => {
          const meta = KIND_META[t.kind]
          return (
            <div
              key={t.id}
              role={meta.role}
              onClick={() => dismiss(t.id)}
              className={`pointer-events-auto flex cursor-pointer items-center gap-2 rounded-md border bg-surface px-4 py-2.5 text-sm text-fg shadow-lg ${meta.border}`}
            >
              <span className={meta.icon}>
                <meta.Icon size={16} />
              </span>
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

/** 在 ToastProvider 内使用；返回稳定引用对象（error/success/info/warning 不随渲染变化） */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast 必须在 ToastProvider 内使用')
  return api
}
