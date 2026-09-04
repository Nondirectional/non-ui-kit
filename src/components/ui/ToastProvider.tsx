import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { IconCheck, IconX } from '../../icons'

interface ToastItem {
  id: number
  kind: 'error' | 'success'
  message: string
}

export interface ToastApi {
  /** 失败提示（role="alert"，danger 语义配色） */
  error: (message: string) => void
  /** 成功提示（role="status"，success 语义配色） */
  success: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** 自动消失时长：错误提示留出阅读与重试间隔 */
const TOAST_MS = 3500

/**
 * 全局轻量 Toast（08-19-replace-native-ui 决策 A2）：Context 自建零依赖，
 * fixed 顶部居中堆叠、z-[60] 高于 dialog 的 z-50，深浅主题靠语义 token 适配。
 * 每条独立 timer 自动消失，Provider 卸载时统一清理。
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
    (kind: ToastItem['kind'], message: string) => {
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
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={`flex items-center gap-2 rounded-md border bg-surface px-4 py-2.5 text-sm text-fg shadow-lg ${
              t.kind === 'error' ? 'border-danger' : 'border-success'
            }`}
          >
            <span className={t.kind === 'error' ? 'text-danger' : 'text-success'}>
              {t.kind === 'error' ? <IconX size={16} /> : <IconCheck size={16} />}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** 在 ToastProvider 内使用；返回稳定引用对象（error/success 不随渲染变化） */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast 必须在 ToastProvider 内使用')
  return api
}
