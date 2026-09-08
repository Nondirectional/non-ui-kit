# Changelog

本包遵循语义化版本；通过 git tag（`vX.Y.Z`）分发，不发 npm registry。

## 0.2.1（未发布）

文档级增量，无组件变更：

- 新增 LLM 友好索引 `llms.txt`（仓库根，reka-ui llms.txt 索引层的本地变体）：
  引言（定位与关键纪律）+ 分区块索引（表单 / 看板 / 反馈与浮层 / Provider /
  图标 / 主题 / 工具函数 / 规约），每条「源文件链接 + 一句话 API 摘要」，
  直接链接源码 JSDoc，不做二次搬运的文档层
- `src/test/llms.test.ts` 双向锁：索引死链、或 `src/index.ts` 新增导出未
  登记即 `pnpm test` 失败；文件读取走 `import.meta.glob`（src 随包直出会被
  消费方 tsc 检查，不引入 node 类型依赖）
- `exports` 增 `"./llms.txt"`：消费方 AI agent 可在 node_modules 内直接发现

## 0.2.0（未发布）

数据看板（non-tokens 筹备）场景增量：5 个新组件，纯增量无破坏性变更；
全部语义 token 取色（本轮未新增 token），明暗双主题免 `dark:` 分支。

- `Card`（+ `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` /
  `CardFooter`）：KPI 卡与面板容器统一皮肤（配方归拢自消费方存量手写卡片），
  `variant="highlight"` 为 accent 左边框强调卡
- `Tabs`（+ `TabsList` / `TabsTrigger` / `TabsContent`）：Radix Tabs 薄封装，
  受控 `value` / `onValueChange`（图表粒度切换：小时/天/周/月）；
  分段控件形态，选中 accent 实心胶囊
- `Table`（+ `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell`）：
  原生语义表格封装；受控表头排序 `sort` / `onSortChange`（同列点击翻转、
  新列默认降序，`initialDirection` 可改升序起始），`aria-sort` + 方向 chevron；
  排序数据重排由消费方完成，组件只管状态交互
- `Badge`：语义色胶囊徽标，5 变体（neutral / accent / success / warning /
  danger，soft 底 + 同语义字色查表），`dot` 前置状态圆点（bg-current 随字色）
- `Switch`：Radix Switch 薄封装，受控 `checked` / `onCheckedChange`，
  轨道 36×20（h-5 w-9）选中 accent 实心
- 新增依赖 `@radix-ui/react-tabs` / `@radix-ui/react-switch`：消费方
  vite.config.ts 的 `optimizeDeps.include` 需相应补两行（README / template 已更新）
- 测试：每组件共置 Vitest；新增 `src/test/theme.tsx` 的 `renderInTheme`
  helper，以「暗色容器下行为与类串同亮色逐字一致」断言锁定零 `dark:` 分支契约

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
