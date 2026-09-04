import '@testing-library/jest-dom/vitest'

/*
 * jsdom 未实现的指针/滚动 API stub：Radix Select（08-19 批次 B 起 ui/Select 的
 * 底层）在打开弹层与高亮选项时会调用 hasPointerCapture / scrollIntoView，
 * 缺失时直接抛 TypeError。stub 为 no-op 即可让组件树在 jsdom 下正常渲染。
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false
}
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = () => {}
}
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

/*
 * jsdom 同样没有 window.matchMedia（08-20-mobile-h5 批 3 起 utils/useIsDesktop
 * 在渲染期读取，theme/useTheme 在模块加载期读取）。全局兜底 stub 只回答
 * (min-width: 768px) 为匹配——jsdom 无真实视口，按桌面路径渲染，与既有测试
 * 的默认断言形态一致；需要精确控制匹配值的测试文件用 vi.stubGlobal 覆盖
 * （见 useTheme.test / DesktopGuardedForm.test，unstubAllGlobals 会还原回本 stub）。
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: query.includes('min-width: 768px'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}
