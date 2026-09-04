import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfirmProvider, ToastProvider, TooltipProvider } from '@non/ui'
import App from './App'
import './index.css'

// 全局 Provider 挂应用根部：Confirm（确认弹窗）、Toast（轻提示）、
// Tooltip（TooltipProvider 缺失时 Tooltip 直接抛错，Radix 要求）
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfirmProvider>
      <ToastProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </ToastProvider>
    </ConfirmProvider>
  </StrictMode>,
)
