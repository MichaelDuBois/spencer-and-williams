import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGaPageview } from '@/hooks/useGaPageview'

const usePathnameMock = vi.fn<() => string>()
const sendGAEventMock = vi.fn()

vi.mock('next/navigation', () => {
  return {
    usePathname: () => usePathnameMock(),
  }
})

vi.mock('@next/third-parties/google', () => {
  return {
    sendGAEvent: (...args: unknown[]) => sendGAEventMock(...args),
  }
})

describe('useGaPageview', () => {
  beforeEach(() => {
    usePathnameMock.mockReset()
    sendGAEventMock.mockReset()
  })

  it('does not fire a page_view on initial render', () => {
    usePathnameMock.mockReturnValue('/grocery')

    renderHook(() => useGaPageview())

    expect(sendGAEventMock).not.toHaveBeenCalled()
  })

  it('fires a page_view with content_group on client-side navigation', () => {
    usePathnameMock.mockReturnValue('/grocery')

    const { rerender } = renderHook(() => useGaPageview())

    sendGAEventMock.mockClear()
    usePathnameMock.mockReturnValue('/travel/hotels')

    rerender()

    expect(sendGAEventMock).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        page_path: '/travel/hotels',
        content_group: 'travel',
      }),
    )
  })

  it('maps the home route to the "home" content group', () => {
    usePathnameMock.mockReturnValue('/grocery')

    const { rerender } = renderHook(() => useGaPageview())

    sendGAEventMock.mockClear()
    usePathnameMock.mockReturnValue('/')

    rerender()

    expect(sendGAEventMock).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({ content_group: 'home' }),
    )
  })
})
