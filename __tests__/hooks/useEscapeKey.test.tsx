import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useEscapeKey } from '@/hooks/useEscapeKey'

const pressKey = (key: string) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key }))

describe('useEscapeKey', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls onEscape on Escape keydown when enabled', () => {
    const onEscape = vi.fn()
    renderHook(() => useEscapeKey(onEscape, true))

    pressKey('Escape')

    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('ignores other keys', () => {
    const onEscape = vi.fn()
    renderHook(() => useEscapeKey(onEscape, true))

    pressKey('Enter')

    expect(onEscape).not.toHaveBeenCalled()
  })

  it('does not subscribe when disabled', () => {
    const onEscape = vi.fn()
    renderHook(() => useEscapeKey(onEscape, false))

    pressKey('Escape')

    expect(onEscape).not.toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    const onEscape = vi.fn()
    const { unmount } = renderHook(() => useEscapeKey(onEscape, true))

    unmount()
    pressKey('Escape')

    expect(onEscape).not.toHaveBeenCalled()
  })

  it('unsubscribes when enabled flips to false', () => {
    const onEscape = vi.fn()
    const { rerender } = renderHook(
      ({ enabled }) => useEscapeKey(onEscape, enabled),
      { initialProps: { enabled: true } },
    )

    rerender({ enabled: false })
    pressKey('Escape')

    expect(onEscape).not.toHaveBeenCalled()
  })

  it('calls the latest onEscape without re-subscribing', () => {
    const first = vi.fn()
    const second = vi.fn()
    const addSpy = vi.spyOn(window, 'addEventListener')
    const { rerender } = renderHook(
      ({ handler }) => useEscapeKey(handler, true),
      { initialProps: { handler: first } },
    )
    const subscribeCount = addSpy.mock.calls.filter(
      ([type]) => type === 'keydown',
    ).length

    rerender({ handler: second })
    pressKey('Escape')

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    const finalCount = addSpy.mock.calls.filter(
      ([type]) => type === 'keydown',
    ).length
    expect(finalCount).toBe(subscribeCount)
  })
})
