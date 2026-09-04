import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// @non/ui 源码直出（TS 源码随包分发）：必须排除预打包，让 Vite 走源码管线即时编译。
// 缺了这行 dev 模式下会报「无法预打包 TS 源码」类错误。
// include 必须与 exclude 成对出现：被 exclude 的包，其源码里的裸导入（@radix-ui/*
// / react-remove-scroll）不进 Vite 依赖扫描入口；若应用又直接 import 了其中某个
// （如 @radix-ui/react-dialog），该包会以「预打包」+「.pnpm 散件」双实例加载——
// Radix DismissableLayer 的层栈协调依赖模块单例，双实例会断裂：modal Dialog 锁
// body pointer-events 后，后开的 Select/Popover 弹层拿不到 pe:auto 恢复而不可点。
// 显式 include 强制统一走预打包单实例。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['@non/ui'],
    include: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      'react-remove-scroll',
    ],
  },
})
