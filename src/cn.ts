/**
 * 类名拼接（零依赖，替代 clsx）：falsy 段直接丢弃。
 *
 * 约定（见 .trellis/spec/frontend/ui-theme.md 与 task 08-18-deepl-ui-refresh design §2.1）：
 * 本仓库没有 tailwind-merge，同名工具类的胜者由样式表顺序决定、不可预测——
 * 组件内部变体类必须「一次只拼一条完整类串」（查表），消费者只允许追加
 * 布局类（w-full / flex-1 等），禁止覆盖组件的内距 / 字号 / 配色类。
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
