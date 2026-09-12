import { describe, expect, it } from 'vitest'
import { sanitizeUrl } from '@/utils/content/sanitizeUrl'

describe('sanitizeUrl', () => {
  it('放行常规安全 URL', () => {
    expect(sanitizeUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1')
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
    expect(sanitizeUrl('/uploads/img.png')).toBe('/uploads/img.png')
    expect(sanitizeUrl('//cdn.example.com/x.js')).toBe('//cdn.example.com/x.js')
    expect(sanitizeUrl('mailto:a@b.com')).toBe('mailto:a@b.com')
  })

  it('拦截脚本注入类协议', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined()
    expect(sanitizeUrl('vbscript:msgbox')).toBeUndefined()
    expect(sanitizeUrl('data:text/html,<script>')).toBeUndefined()
    expect(sanitizeUrl('file:///etc/passwd')).toBeUndefined()
  })

  it('大小写混写同样拦截', () => {
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBeUndefined()
    expect(sanitizeUrl('DATA:text/html,x')).toBeUndefined()
  })

  it('去除控制字符后再校验，防止协议混淆', () => {
    expect(sanitizeUrl('java\tscript:alert(1)')).toBeUndefined()
    expect(sanitizeUrl('java\nscript:alert(1)')).toBeUndefined()
  })

  it('空值与空白返回 undefined', () => {
    expect(sanitizeUrl(undefined)).toBeUndefined()
    expect(sanitizeUrl(null)).toBeUndefined()
    expect(sanitizeUrl('')).toBeUndefined()
    expect(sanitizeUrl('   ')).toBeUndefined()
  })

  it('返回前去除首尾空白，保留 URL 主体', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com')
  })
})
