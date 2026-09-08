import { describe, expect, it } from 'vitest'

/*
 * llms.txt 索引完整性锁（09-08 llms-txt）：
 * - 正向：索引里每个相对链接都指向真实文件（防死链）
 * - 反向：src/index.ts 的每个 re-export 源文件都被索引收录（新增组件漏登记直接红）
 * - 规约锚点：tokens.css / README / CHANGELOG 必须在索引里（改组件前必读项）
 *
 * 文件读取经 import.meta.glob（vite 管线）而非 node:fs——src/ 下源码随包直出，
 * 消费方 tsc 会把它纳入检查，不能引入 node 类型依赖。存在集用无 eager 的 glob：
 * 只登记键（真实文件清单）不执行任何模块。
 */

const llms = (
  import.meta.glob('/llms.txt', { query: '?raw', import: 'default', eager: true }) as Record<
    string,
    string
  >
 )['/llms.txt']
const indexTs = (
  import.meta.glob('/src/index.ts', { query: '?raw', import: 'default', eager: true }) as Record<
    string,
    string
  >
 )['/src/index.ts']

/** 仓库内真实存在的文件（src 全树 + 根级 md/txt），键形如 '/src/...'、'/README.md' */
const existing = new Set([
  ...Object.keys(import.meta.glob('/src/**/*')),
  ...Object.keys(import.meta.glob('/*.{md,txt}')),
])

/** llms.txt 中的相对路径链接（http 外链不校验） */
const linked = [...llms.matchAll(/\]\(([^)]+)\)/g)]
  .map((m) => m[1])
  .filter((t) => !/^https?:/.test(t))

/** src/index.ts 全部 re-export 的源文件（import 省略扩展名，经存在集解析为真实路径） */
const exportedFiles = [...indexTs.matchAll(/from '\.\/([^']+)'/g)]
  .map((m) => `src/${m[1]}`)
  .map((file) => {
    const match = [...existing].find((f) => f === `/${file}.ts` || f === `/${file}.tsx`)
    if (!match) throw new Error(`index.ts 导出路径无法解析为真实文件: ${file}`)
    return match.slice(1)
  })

describe('llms.txt 索引完整性', () => {
  it('索引中的每个相对链接都指向真实文件', () => {
    expect(linked.length).toBeGreaterThan(10) // 防解析失效导致的空集假绿
    for (const target of linked) {
      expect(existing.has(`/${target}`), `索引链接了不存在的文件: ${target}`).toBe(true)
    }
  })

  it('src/index.ts 的每个导出源文件都被索引收录（新组件不得漏登）', () => {
    expect(exportedFiles.length).toBeGreaterThan(10)
    for (const file of exportedFiles) {
      expect(llms, `llms.txt 未收录导出源文件: ${file}`).toContain(`(${file})`)
    }
  })

  it('规约锚点（tokens / README / CHANGELOG）在索引内', () => {
    for (const anchor of ['src/tokens.css', 'README.md', 'CHANGELOG.md']) {
      expect(llms).toContain(`(${anchor})`)
    }
  })
})
