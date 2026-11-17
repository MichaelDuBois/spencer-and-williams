import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

afterEach(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

describe('useBodyScrollLock', () => {
  it('locks body + documentElement overflow and sets paddingRight when isLocked is true', () => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    renderHook(() => useBodyScrollLock(true))

    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.paddingRight).toBe(`${scrollbarWidth}px`)
  })

  it('does not lock when isLocked is false', () => {
    renderHook(() => useBodyScrollLock(false))

    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
  })

  it('clears all three styles when isLocked flips to false', () => {
    const { rerender } = renderHook(
      ({ isLocked }) => useBodyScrollLock(isLocked),
      { initialProps: { isLocked: true } },
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender({ isLocked: false })

    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
  })

  it('cleans up styles on unmount', () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true))

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
  })
})
