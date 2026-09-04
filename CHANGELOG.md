# Changelog

本包遵循语义化版本；通过 git tag（`vX.Y.Z`）分发，不发 npm registry。

## 0.1.0（未发布）

首个版本：从 work-dispatcher `frontend/src` 抽取。

- 12 个 UI 基础组件 + select-search 内部共享件 + cn，全部携带同目录 Vitest 测试
- 30 个线性描边图标（icons.tsx）
- `useTheme` 主题 hook：localStorage key 参数化（默认 `'theme'`，原仓库默认 `'wd:theme'`），
  light/dark/system 三态语义不变
- 日期纯函数工具（utils/date）
- `tokens.css`：通用语义令牌（明暗两套）+ `@custom-variant dark` + `@theme inline`
  类注册 + 组件配套全局 CSS（弹层动画关键帧、小屏 bottom sheet 媒体查询）；
  业务令牌（`--type-*`）不进包
- template / README 接线加固：`optimizeDeps.exclude` 必须与 `include`（`@radix-ui/*`、
  `react-remove-scroll`）成对出现——否则消费方直接 import radix 时同一包会以预打包
  + .pnpm 散件双实例加载，Radix DismissableLayer 层栈（modal Dialog 的 body
  pointer-events 协调）断裂，dialog 内 Select/Popover 弹层不可点
  （work-dispatcher dogfood E2E 实测回归，09-04 修复）
