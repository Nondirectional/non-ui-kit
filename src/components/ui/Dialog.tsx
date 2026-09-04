import { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { IconX } from '../../icons'
import { cn } from '../../cn'

interface AppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** 对话框主体（表单等内容） */
  children: ReactNode
  /** 底部按钮区（右对齐，gap-2）；表单提交语义由调用方自带，AppDialog 只管壳 */
  footer?: ReactNode
  /** 面板宽度档，默认 md */
  width?: 'sm' | 'md' | 'lg'
}

const WIDTH_CLASSES: Record<NonNullable<AppDialogProps['width']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

/**
 * 全站统一对话框壳（Radix Dialog 封装，吸收 6 处样板）：
 * overlay=bg-overlay、panel=rounded-lg bg-surface p-6 shadow-xl、标题行带右上关闭钮。
 * 不接管表单语义——children 里的 form / footer 里的按钮行为均由调用方决定。
 */
export function AppDialog({
  open,
  onOpenChange,
  title,
  children,
  footer,
  width = 'md',
}: AppDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-4rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-surface p-6 shadow-xl',
            // 小屏 bottom sheet（AC5）：贴底全宽、顶圆角、预留手势条安全区
            'max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:left-auto max-md:h-auto max-md:max-h-[85dvh] max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-b-none max-md:rounded-t-xl max-md:pb-[calc(env(safe-area-inset-bottom)+1rem)]',
            WIDTH_CLASSES[width],
          )}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-fg">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="关闭"
              className="rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <IconX size={16} />
            </Dialog.Close>
          </div>

          <div className="mt-4">{children}</div>

          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
