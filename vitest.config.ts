import { defineConfig } from 'vitest/config'

// 与 work-dispatcher frontend 的测试形态对齐（其 vitest 配置内联在 vite.config.ts）：
// jsdom + globals + setupFiles（jest-dom / Radix 与 matchMedia 的 jsdom stub）。
// 包内测试与组件同目录共置（*.test.tsx），无 e2e 目录，无需 exclude。
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
