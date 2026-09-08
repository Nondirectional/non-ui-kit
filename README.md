# @non/ui

通用 React UI 基础件包：语义设计令牌（明暗双主题）+ 薄封装组件套件，抽离自
work-dispatcher 前端沉淀。**源码直出**（ship TS 源码，不做 dist 构建）——所有消费方
均为 Vite，编译发生在下游；Tailwind v4 通过 `@source` 直接扫描包内类名。

- React 19 · TypeScript strict · Tailwind CSS v4（CSS-first，无 tailwind.config.js）
- 组件测试随包迁移（Vitest + Testing Library，`pnpm test` 全量运行）

## 安装

```bash
pnpm add @non/ui@github:Nondirectional/non-ui-kit#v0.1.0
```

> `github:Nondirectional/non-ui-kit#v0.1.0` 为提交形态的占位写法：包通过 git tag 分发，
> 不发 npm registry。远端仓库建成并打上 `v0.1.0` tag 后即可安装；本地联调可临时用
> `file:../non-ui-kit`。依赖 React 19（peerDependencies），消费方需自备
> `react` / `react-dom`。
>
> 注意：pnpm 对 `file:` 目录依赖做的是安装时快照（硬链接副本），且不感知源目录内容
> 变化——改包后消费方需 `rm -rf node_modules && pnpm install` 强制刷新。

## 消费方两处必配（缺一组件即裸奔/无样式）

1. **vite.config.ts** —— 阻止 Vite 预打包包内 TS 源码，并固定其运行时依赖为预打包单实例：

   ```ts
   export default defineConfig({
     // ...
     optimizeDeps: {
       exclude: ['@non/ui'],
       // 与 exclude 成对出现（缺省时若应用直接 import 了其中某个包，会双实例加载，
       // Radix DismissableLayer 层栈协调断裂 → dialog 内弹层不可点）
       include: [
         '@radix-ui/react-dialog',
         '@radix-ui/react-dropdown-menu',
         '@radix-ui/react-popover',
         '@radix-ui/react-select',
         '@radix-ui/react-slot',
         '@radix-ui/react-switch',
         '@radix-ui/react-tabs',
         '@radix-ui/react-tooltip',
         'react-remove-scroll',
       ],
     },
   })
   ```

2. **index.css** —— 引入令牌 + 让 Tailwind v4 扫描包内类名：

   ```css
   @import 'tailwindcss';
   @import '@non/ui/tokens.css';               /* 语义令牌 + @custom-variant dark + 组件配套全局 CSS */
   @source '../node_modules/@non/ui/src';      /* 遗漏此行：组件类名不会被生成，样式丢失 */
   ```

   `@source` 的路径相对 index.css 所在目录（通常 `src/`）。

另建议在 index.css 的 `@layer base` 里放置应用基础样式（`html { color-scheme }` 与
`body` 字号/背景/前景）——tokens.css 刻意不含这部分，见模板 `template/src/index.css`
的现成示例。

主题防白闪（FOUC）脚本见 `template/index.html`：在 bundle 加载前按
`localStorage['theme']` 给 `<html>` 挂 `.dark` 类。

## 组件清单

| 导出 | 说明 |
|---|---|
| `Button` | 全部文本按钮：5 variant × 2 size，`loading` 态；icon-only 按钮不走它 |
| `Input` / `Textarea` | 原生 input / textarea 薄封装（forwardRef，className 只追加布局类） |
| `Select` / `SelectItem` | Radix Select 封装（受控 value、`''`=未选、`width` full/auto、`searchable` 可过滤弹层） |
| `MultiSelect` | Radix DropdownMenu 多选封装（`options` + `value: string[]`、预览截断、`searchable`） |
| `AppDialog` | 统一对话框壳（overlay + 面板 + 标题行 + 关闭钮 + footer 槽位） |
| `DatePicker` / `CalendarPanel` | 自建周一起始月历（Radix Popover 弹层），value `'yyyy-MM-dd'`，`clearable` / `max` |
| `DateTimePicker` | 月历 + 时/分输入行，value `'yyyy-MM-ddTHH:mm'`，缺省时刻 09:00 |
| `Tooltip` / `TooltipProvider` | Radix Tooltip 封装（反色气泡 `bg-fg text-bg`，z-[70]） |
| `ConfirmProvider` / `useConfirm` | 全局确认弹窗，`await confirm({ title, danger? }) → boolean` |
| `ToastProvider` / `useToast` | 轻量 toast（`error`/`success`，3.5s 自动消失，z-[60]） |
| `Dot` | 8px 状态圆点徽标（`inline-block`，带 sr-only 标签） |
| `Card` / `CardHeader` … | 面板容器套件：KPI 卡与面板统一皮肤，`variant="highlight"` accent 左边框强调 |
| `Tabs` / `TabsList` … | Radix Tabs 薄封装（受控 `value`，分段控件形态，图表粒度切换） |
| `Table` / `TableHead` … | 语义表格封装 + 受控表头排序（`sort` + `onSortChange`：同列翻转、新列默认降序） |
| `Badge` | 语义色胶囊徽章（5 变体 soft 底查表，`dot` 前置状态点） |
| `Switch` | Radix Switch 薄封装（受控 `checked` + `onCheckedChange`，设置项开关） |
| `useTheme(key?)` / `setTheme` | 主题三态（light/dark/system）读写 `localStorage[key]` + 切 `<html>.dark`；key 默认 `'theme'`，多应用同域时传独立 key |
| `Icon*`（30 个） | 线性描边图标（stroke 1.4 / currentColor，16px 默认） |
| `cn` | 零依赖类名拼接（无 tailwind-merge：同名工具类胜者由样式表顺序决定，消费者只许追加布局类） |
| 日期工具 | `parseDateInput` / `buildMonthMatrix` / `todayInput` / `addDaysInput` / `presetRange` 等（本地时区纯函数） |

`ConfirmProvider`、`ToastProvider`、`TooltipProvider` 挂在应用根部；`TooltipProvider`
缺失时 Tooltip 直接抛错（Radix 要求）。

## LLM 友好索引（llms.txt）

仓库根的 [llms.txt](llms.txt) 是给 AI 助手的组件索引（reka-ui llms.txt 形态的本地变体）：
每个导出一条「源文件链接 + 一句话 API 摘要」，指向源码 JSDoc 按需精读——本库源码注释
即 API 文档，不做二次搬运的独立文档站。配套 `src/test/llms.test.ts` 双向锁：索引死链、
或 `src/index.ts` 新增导出未登记，`pnpm test` 直接红。包入口 `@non/ui/llms.txt` 已在
exports 暴露，消费方 agent 可直接在 node_modules 内发现。

## 升级

```bash
# 方式一：改 package.json 里的 tag 号后重装
pnpm add @non/ui@github:Nondirectional/non-ui-kit#v0.2.0

# 方式二：tag 范围内升级
pnpm update @non/ui
```

版本约定：git tag 语义化版本（`vX.Y.Z`），包内 `CHANGELOG.md` 记录变更。改包 →
更新 CHANGELOG → 打 tag → 消费方改 tag 升级。未发远端前（本地 `file:` 联调），升级
即拉取本地最新代码。

## 仓库内开发

```bash
pnpm install
pnpm test        # vitest 全量（组件测试与源码同目录共置）
pnpm typecheck   # tsc --noEmit
```

`template/` 是配套启动模板（copy 出去用的最小应用，非 workspace 子包），见
`template/README.md`。
