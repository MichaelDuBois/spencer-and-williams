import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaEntertainmentSearchInput } from '@/app/media-entertainment/_components/MediaEntertainmentSearchInput'

/**
 * Drives the real `useMediaEntertainmentSearchInput` and the real
 * `useSearchInput` underneath it through the component, so the category-to-global
 * navigation is exercised end to end. Presentation lives in
 * `MediaEntertainmentSearchInput.test.tsx`, which stubs the hook instead — these
 * two files deliberately mock opposite halves and cannot be merged into one.
 */

const usePathnameMock = vi.fn()
const pushMock = vi.fn()
const replaceMock = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => {return {
  usePathname: () => usePathnameMock(),
  useRouter: () => {return { push: pushMock, replace: replaceMock }},
  useSearchParams: () => searchParams,
}})

const { handleAIModeClickMock } = vi.hoisted(() => {
  return { handleAIModeClickMock: vi.fn() }
})

/**
 * A single search-box state shared by every consumer, like the real provider.
 * A per-hook `useState` would let the input and the routing read below drift
 * apart, which is exactly the interaction these tests need to observe.
 */
const { searchBoxStore } = vi.hoisted(() => {
  const listeners = new Set<() => void>()
  let query = ''
  return {
    searchBoxStore: {
      getQuery: () => query,
      refine: (value: string) => {
        query = value
        listeners.forEach((listener) => listener())
      },
      reset: () => {
        query = ''
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },
    },
  }
})

vi.mock('react-instantsearch', async () => {
  const { useSyncExternalStore } = await import('react')
  return {
    useSearchBox: () => {
      const query = useSyncExternalStore(
        searchBoxStore.subscribe,
        searchBoxStore.getQuery,
        searchBoxStore.getQuery,
      )
      return { query, refine: searchBoxStore.refine }
    },
  }
})

vi.mock('@/features/aiAssistant', () => {
  return {
    useOpenAssistantPanel: () => {
      return { openWithMessage: handleAIModeClickMock }
    },
  }
})

vi.mock('@/hooks/useIntentRouting', () => {
  return {
    useIntentRouting: () => {
      return { routeIfConversational: () => false }
    },
  }
})

/**
 * Stands in for InstantSearch's URL routing, which is enabled by default in
 * `InstantSearchProvider`. It re-reads the live `window.location` from an
 * effect on an ancestor of the search input (`useInstantSearchRouting`'s
 * `getLocation` returns `window.location` once mounted), so React runs it
 * *after* the input's own effects. That ordering is what lets a stale URL
 * overwrite a restored draft, so the harness has to reproduce it.
 */
const RoutingHarness = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathnameMock()

  useEffect(() => {
    searchBoxStore.refine(
      new URLSearchParams(window.location.search).get('query') ?? '',
    )
  }, [pathname])

  return <>{children}</>
}

const SearchInputUnderRouting = () => (
  <RoutingHarness>
    <MediaEntertainmentSearchInput isOverlay={false} />
  </RoutingHarness>
)

/** Points the mocked navigation hooks and the jsdom URL at the same location. */
const navigateTo = (url: string) => {
  const [pathname, search = ''] = url.split('?')
  usePathnameMock.mockReturnValue(pathname)
  searchParams = new URLSearchParams(search)
  window.history.replaceState(null, '', url)
}

const renderAt = (url: string) => {
  navigateTo(url)
  return render(<SearchInputUnderRouting />)
}

/** Simulates a navigation committing: the URL, the hooks and the tree all move. */
const arriveAt = (rerender: (ui: React.ReactElement) => void, url: string) => {
  navigateTo(url)
  rerender(<SearchInputUnderRouting />)
}

const getUrlQuery = () =>
  new URLSearchParams(window.location.search).get('query')

const getField = () =>
  screen.queryByPlaceholderText('Search movies and shows...')

describe('useMediaEntertainmentSearchInput', () => {
  beforeEach(() => {
    usePathnameMock.mockReset()
    pushMock.mockReset()
    replaceMock.mockReset()
    searchParams = new URLSearchParams()
    handleAIModeClickMock.mockReset()
    searchBoxStore.reset()
    window.history.replaceState(null, '', '/')
  })

  it.each(['tv-series', 'movies', 'new-popular'])(
    'searches the whole catalogue when typing from %s',
    (section) => {
      renderAt(`/media-entertainment/search/${section}`)

      fireEvent.change(getField()!, { target: { value: 'Batman & Robin' } })

      expect(replaceMock).toHaveBeenCalledWith(
        '/media-entertainment/search?query=Batman%20%26%20Robin',
      )
    },
  )

  it('navigates once and preserves typing while the section route is still loading', async () => {
    const { rerender } = renderAt('/media-entertainment/search/tv-series')

    await userEvent.type(getField()!, 'Batman & Robin')

    expect(replaceMock).toHaveBeenCalledTimes(1)
    expect(replaceMock).toHaveBeenCalledWith(
      '/media-entertainment/search?query=B',
    )
    expect(pushMock).not.toHaveBeenCalled()
    expect(getField()).toHaveValue('Batman & Robin')

    arriveAt(rerender, '/media-entertainment/search?query=B')

    expect(getField()).toHaveValue('Batman & Robin')
    await userEvent.type(getField()!, ' returns')
    expect(getField()).toHaveValue('Batman & Robin returns')
    expect(replaceMock).toHaveBeenCalledTimes(1)
  })

  // Regression: routing used to re-read the stale `?query=B` straight after the
  // draft was restored and refine back to the first keystroke, dropping every
  // character typed during the navigation window.
  it('searches the buffered draft, not the stale URL query, on arrival', async () => {
    const { rerender } = renderAt('/media-entertainment/search/tv-series')

    await userEvent.type(getField()!, 'Batman')
    expect(replaceMock).toHaveBeenCalledWith(
      '/media-entertainment/search?query=B',
    )

    arriveAt(rerender, '/media-entertainment/search?query=B')

    expect(getField()).toHaveValue('Batman')
    // The results follow the search box, so this is what the user actually sees.
    expect(searchBoxStore.getQuery()).toBe('Batman')
    // Corrected in place so routing's own read agrees with the draft.
    expect(getUrlQuery()).toBe('Batman')
  })

  it('keeps the query cleared if cleared during navigation', async () => {
    const { rerender } = renderAt('/media-entertainment/search/tv-series')
    await userEvent.type(getField()!, 'Batman')
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    arriveAt(rerender, '/media-entertainment/search?query=B')

    expect(getField()).toHaveValue('')
    expect(searchBoxStore.getQuery()).toBe('')
    expect(getUrlQuery()).toBeNull()
    expect(replaceMock).toHaveBeenCalledTimes(1)
  })

  it('allows another global search after revisiting the same section', async () => {
    const { rerender } = renderAt('/media-entertainment/search/tv-series')
    await userEvent.type(getField()!, 'Batman')

    arriveAt(rerender, '/media-entertainment/search?query=B')
    arriveAt(rerender, '/media-entertainment/search/tv-series')
    await userEvent.type(getField()!, 'Superman')

    expect(replaceMock).toHaveBeenCalledTimes(2)
    expect(replaceMock).toHaveBeenLastCalledWith(
      '/media-entertainment/search?query=S',
    )
  })

  it('keeps category browsing in place when the search field receives focus', async () => {
    renderAt('/media-entertainment/search/tv-series')

    await userEvent.click(getField()!)

    expect(pushMock).not.toHaveBeenCalled()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('does not navigate again when typing on global search', () => {
    renderAt('/media-entertainment/search')

    fireEvent.change(getField()!, { target: { value: 'Batman' } })

    expect(pushMock).not.toHaveBeenCalled()
    expect(replaceMock).not.toHaveBeenCalled()
  })
})
