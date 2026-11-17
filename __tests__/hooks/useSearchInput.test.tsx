import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSearchInput } from '@/hooks/useSearchInput'

const pushMock = vi.fn()
const usePathnameMock = vi.fn()
const refineMock = vi.fn()
const routeIfConversationalMock = vi.fn()

vi.mock('next/navigation', () => {return {
  useRouter: () => {return { push: pushMock }},
  usePathname: () => usePathnameMock(),
  useSearchParams: () => new URLSearchParams(),
}})

vi.mock('react-instantsearch', () => {return {
  useSearchBox: () => {return { query: '', refine: refineMock }},
}})

vi.mock('@/features/aiAssistant', () => {return {
  useOpenAssistantPanel: () => {return { openWithMessage: vi.fn() }},
}})

vi.mock('@/hooks/useIntentRouting', () => {return {
  useIntentRouting: () => {return {
    routeIfConversational: routeIfConversationalMock,
  }},
}})

const typeAndSubmit = (pathname: string, value: string) => {
  usePathnameMock.mockReturnValue(pathname)
  const { result } = renderHook(() => useSearchInput('/fashion'))

  act(() => {
    result.current.handleInputChange({
      target: { value },
    } as React.ChangeEvent<HTMLInputElement>)
  })

  const preventDefault = vi.fn()
  act(() => {
    result.current.handleSubmit({
      preventDefault,
    } as unknown as React.FormEvent)
  })

  return { preventDefault }
}

describe('useSearchInput', () => {
  beforeEach(() => {
    pushMock.mockReset()
    refineMock.mockReset()
    routeIfConversationalMock.mockReset()
    routeIfConversationalMock.mockReturnValue(false)
  })

  it('hands the submitted query to intent routing', () => {
    typeAndSubmit('/fashion', 'can you recommend a wool coat')

    expect(routeIfConversationalMock).toHaveBeenCalledWith(
      'can you recommend a wool coat',
    )
  })

  it('does not navigate when intent routing handled the query', () => {
    routeIfConversationalMock.mockReturnValue(true)

    typeAndSubmit('/fashion', 'can you recommend a wool coat')

    expect(pushMock).not.toHaveBeenCalled()
  })

  it('navigates to the search page when the query is not conversational', () => {
    typeAndSubmit('/fashion', 'wool coat')

    expect(pushMock).toHaveBeenCalledWith('/fashion/search?query=wool%20coat')
  })

  it('stays put when already on the search page', () => {
    typeAndSubmit('/fashion/search', 'wool coat')

    expect(pushMock).not.toHaveBeenCalled()
  })

  it('always prevents the browser form submission', () => {
    const { preventDefault } = typeAndSubmit('/fashion', 'wool coat')

    expect(preventDefault).toHaveBeenCalled()
  })
})
