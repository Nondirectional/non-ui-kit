# non-starter 启动模板

`@non/ui` 的配套启动模板：最小可运行的 Vite + React 19 + TypeScript + Tailwind v4
应用，已接好设计令牌、明暗主题与全局 Provider，并用 demo 页覆盖全部组件。
**copy 出去改个名即可开始开发**——它不是被安装的包，也不在 pnpm workspace 里。

## 已内置

- `src/index.css`：`@import 'tailwindcss'` + `@import '@non/ui/tokens.css'` +
  `@source '../node_modules/@non/ui/src'`（Tailwind v4 扫描包内类名，**不可删**）+
  应用基础样式（body 14px / color-scheme）
- `vite.config.ts`：`optimizeDeps.exclude: ['@non/ui']`（**不可删**，包是 TS 源码直出）
  + `optimizeDeps.include: ['@radix-ui/*', 'react-remove-scroll']`（与 exclude 成对，
  防应用直接 import radix 时双实例加载导致 dialog 内弹层不可点，**不可删**）
- `index.html`：防白闪 FOUC 脚本（bundle 加载前按 `localStorage['theme']` 挂 `<html>.dark`）
- `src/main.tsx`：`ConfirmProvider` + `ToastProvider` + `TooltipProvider` 挂应用根部
- `src/demo/`：全部组件的用法示例（含明暗切换 ThemeToggle、searchable 下拉、
  危险操作确认等），抄写参考用，接入业务后可整目录删除
- 侧栏 + 顶栏最小布局骨架：视口高度链（`grid-rows-[minmax(0,1fr)]` + `min-h-0`）
  已按规范接好，内部滚动不塌

## 使用

```bash
# 1. 复制模板目录到新项目位置并改名
cp -r /path/to/non-ui-kit/template /path/to/my-app
cd /path/to/my-app

# 2. 改名：package.json 的 "name" 字段，以及 index.html 的 <title>

# 3. 安装依赖（@non/ui 通过 git tag 拉取）
pnpm install

# 4. 启动
pnpm dev      # http://localhost:5173
pnpm build    # tsc --noEmit && vite build
```

## 升级 @non/ui

```bash
# 改 package.json 里依赖的 tag 号
"@non/ui": "github:Nondirectional/non-ui-kit#vX.Y.Z"
pnpm install
# 或 tag 范围内直接更新
pnpm update @non/ui
```

升级前看包仓库 `CHANGELOG.md` 的破坏性变更说明。

## 常见问题

- **组件样式丢失（裸奔）**：`@source '../node_modules/@non/ui/src'` 被删了，或路径
  相对 index.css 的位置不对。
- **dev 启动报预打包错误**：`optimizeDeps.exclude: ['@non/ui']` 被删了。
- **dialog 里打开下拉/弹层点不动**：`optimizeDeps.include` 里的 radix 清单被删了，
  或应用自己直接 import 了 `@radix-ui/*` 却没加进 include——同一包以预打包与
  .pnpm 散件双实例加载，Radix 层栈（pointer-events 协调）断裂。
- **主题刷新闪白**：index.html 的 FOUC 脚本被删了，或脚本里的 storage key 与
  `useTheme(key)` 传的 key 不一致。
