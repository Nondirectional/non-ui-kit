import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react'
import { AppDialog } from './Dialog'
import { Button } from './Button'

export interface ConfirmOptions {
  title: string
  /** 补充说明（如被删对象名），渲染在标题下方的正文区 */
  description?: string
  /** 确认按钮文案，默认「确认」 */
  confirmText?: string
  /** 取消按钮文案，默认「取消」 */
  cancelText?: string
  /** 不可逆/删除类操作：确认按钮用 danger-solid 红按钮 */
  danger?: boolean
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * 全局确认弹窗（08-19-replace-native-ui 决策 A1）：Provider 内持有一个 AppDialog
 * 实例，`useConfirm()` 暴露 Promise 化 confirm，调用侧形如
 * `if (!(await confirm({ title, description, danger: true, confirmText: '删除' }))) return`，
 * 与原原生 confirm 的「同步询问、否即 return」结构对位。弹窗打开期间的并发 confirm
 * 直接 resolve(false)（不排队，实际业务不会并发）。
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    if (resolveRef.current) return Promise.resolve(false)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setOptions(opts)
    })
  }, [])

  /** 统一收口：清 resolve ref、关弹窗、resolve，保证每个 Promise 恰好 settle 一次 */
  const settle = useCallback((value: boolean) => {
    const resolve = resolveRef.current
    resolveRef.current = null
    setOptions(null)
    resolve?.(value)
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AppDialog
        open={options != null}
        onOpenChange={(open) => {
          if (!open) settle(false)
        }}
        title={options?.title ?? ''}
        width="sm"
        footer={
          <>
            <Button onClick={() => settle(false)}>{options?.cancelText ?? '取消'}</Button>
            <Button
              variant={options?.danger ? 'danger-solid' : 'primary'}
              onClick={() => settle(true)}
            >
              {options?.confirmText ?? '确认'}
            </Button>
          </>
        }
      >
        {options?.description && <p className="text-sm text-fg-muted">{options.description}</p>}
      </AppDialog>
    </ConfirmContext.Provider>
  )
}

/** 在 ConfirmProvider 内使用；返回带稳定 confirm 函数的对象 */
export function useConfirm(): { confirm: ConfirmFn } {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm 必须在 ConfirmProvider 内使用')
  return { confirm }
}
