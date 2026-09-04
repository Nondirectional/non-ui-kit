import { cn } from './cn'

describe('cn 类名拼接', () => {
  it('正常：拼接多个非空字符串段', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('边界：丢弃 false / null / undefined 空段，不产生多余空格', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
    expect(cn(false, null, undefined)).toBe('')
  })
})
