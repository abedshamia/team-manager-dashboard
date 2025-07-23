import { cn } from '../utils'

describe('cn utility function', () => {
  it('combines class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active')
  })

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})