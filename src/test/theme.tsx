import type { ReactNode } from 'react'
import { render } from '@testing-library/react'

/**
 * 在指定主题容器内渲染：'dark' = 容器挂 .dark 类（tokens.css 的类式暗色机制，
 * 消费方通过 useTheme 切 <html>.dark，测试里就近挂在包裹 div 上等价）。
 *
 * 库内组件零 dark: 分支、零颜色字面量，明暗差异全部由语义 token 的 CSS 变量
 * 翻转承载——所以暗色用例断言的不是「颜色变了」（jsdom 无样式计算），而是
 * 「组件在暗色容器下的行为与类串与亮色完全一致」这一契约：任何 dark: 分支
 * 或 JS 侧主题判断都会让此类断言失败。
 */
export function renderInTheme(ui: ReactNode, theme: 'light' | 'dark' = 'dark') {
  return render(<div className={theme === 'dark' ? 'dark' : undefined}>{ui}</div>)
}
