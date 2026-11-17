import { renderHook } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { AssistantCatalogContext } from '@/features/aiAssistant/AssistantCatalogContext'
import { useSearch } from '@/features/aiAssistant/hooks/search/useSearch'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { VerticalConfig } from '@/types'

import type { ReactNode } from 'react'

const {
  commerceSearchMock,
  mediaSearchMock,
  travelSearchMock,
  singleIndexMock,
  federatedOptionsMock,
  personalizationParamsMock,
  PERSONALIZATION_PARAMS,
} = vi.hoisted(() => {
  return {
    singleIndexMock: vi.fn(),
    commerceSearchMock: vi.fn(),
    mediaSearchMock: vi.fn(),
    travelSearchMock: vi.fn(),
    federatedOptionsMock: vi.fn(),
    personalizationParamsMock: vi.fn(),
    PERSONALIZATION_PARAMS: { userToken: 'persona-a', enablePersonalization: true },
  }
})

vi.mock('@/hooks/usePersonalizationSearchParams', () => {
  return {
    usePersonalizationSearchParams: () => {
      personalizationParamsMock()
      return PERSONALIZATION_PARAMS
    },
  }
})

vi.mock('@/features/aiAssistant/hooks/search/useSingleIndexSearch', () => {
  return {
    useSingleIndexSearch: (options: unknown) => {
      singleIndexMock(options)
      return commerceSearchMock
    },
  }
})

vi.mock(
  '@/features/aiAssistant/hooks/search/useMediaEntertainmentSearch',
  () => {
    return {
      useMediaEntertainmentSearch: (options: unknown) => {
        federatedOptionsMock('media', options)
        return mediaSearchMock
      },
    }
  },
)

vi.mock('@/features/aiAssistant/hooks/search/useTravelSearch', () => {
  return {
    useTravelSearch: (options: unknown) => {
      federatedOptionsMock('travel', options)
      return travelSearchMock
    },
  }
})

vi.mock('@/features/aiAssistant/hooks/search/useB2BContentSearch', () => {
  return {
    useB2BContentSearch: (options: unknown) => {
      federatedOptionsMock('b2b-content', options)
      return vi.fn()
    },
  }
})

const buildWrapper = (slug: string) => {
  const store = createStore()
  store.set(activeConfigAtom, { slug } as unknown as VerticalConfig)

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )

  return Wrapper
}

const searchWithSlug = async (slug: string) => {
  const { result } = renderHook(() => useSearch(), {
    wrapper: buildWrapper(slug),
  })

  await result.current([{ query: 'something funny' }])
}

describe('useSearch', () => {
  beforeEach(() => {
    commerceSearchMock.mockReset().mockResolvedValue({ summaries: [] })
    mediaSearchMock.mockReset().mockResolvedValue({ summaries: [] })
    travelSearchMock.mockReset().mockResolvedValue({ summaries: [] })
  })

  // An unregistered slug routes to the commerce hook, which searches with a
  // product-shaped extractor and none of the media baseline filters.
  it('routes the media slug to the media hook, not the commerce fallback', async () => {
    await searchWithSlug('media-entertainment')

    expect(mediaSearchMock).toHaveBeenCalledWith([{ query: 'something funny' }])
    expect(commerceSearchMock).not.toHaveBeenCalled()
  })

  it('routes a commerce slug to the shared single-index hook', async () => {
    await searchWithSlug('fashion')

    expect(commerceSearchMock).toHaveBeenCalledTimes(1)
    expect(mediaSearchMock).not.toHaveBeenCalled()
  })

  it('falls back to the commerce hook for an unknown slug', async () => {
    await searchWithSlug('not-a-vertical')

    expect(commerceSearchMock).toHaveBeenCalledTimes(1)
  })
})

it('supplies catalog options only to the B2B product search adapter', () => {
  singleIndexMock.mockClear()
  const catalog = {
    queryOptions: { filters: 'visible_by:"group0"' },
    productCacheKey: ['b2b-products', 'group0'],
    isReady: true,
    sessionKey: '0',
    context: '',
    productContext: null,
    resetSession: vi.fn(),
    signal: new AbortController().signal,
  }
  const getPrice = vi.fn(() => {
    return { basePrice: 100, customerPrice: 85, discountAmount: 15 }
  })
  const Wrapper = buildWrapper('b2b-warehouse')
  renderHook(() => useSearch(), {
    wrapper: ({ children }) => (
      <Wrapper>
        <AssistantCatalogContext.Provider value={{ ...catalog, getPrice }}>
          {children}
        </AssistantCatalogContext.Provider>
      </Wrapper>
    ),
  })
  expect(singleIndexMock).toHaveBeenCalledWith({
    extractor: getB2BWarehouseProductHitValues,
    getPrice,
    queryOptions: catalog.queryOptions,
    productCacheKey: catalog.productCacheKey,
    signal: catalog.signal,
    personalizationParams: PERSONALIZATION_PARAMS,
  })
  for (const [options] of singleIndexMock.mock.calls) {
    if (options.extractor !== getB2BWarehouseProductHitValues)
      expect(options.queryOptions).toBeUndefined()
  }
})

it('reads the persona params once per render and hands them to every vertical search', () => {
  singleIndexMock.mockClear()
  federatedOptionsMock.mockClear()
  personalizationParamsMock.mockClear()

  renderHook(() => useSearch(), { wrapper: buildWrapper('fashion') })

  const renders = personalizationParamsMock.mock.calls.length
  expect(renders).toBeGreaterThan(0)
  expect(singleIndexMock).toHaveBeenCalledTimes(6 * renders)
  for (const [options] of singleIndexMock.mock.calls) {
    expect(options.personalizationParams).toBe(PERSONALIZATION_PARAMS)
  }
  expect(federatedOptionsMock).toHaveBeenCalledTimes(3 * renders)
  expect(federatedOptionsMock.mock.calls.slice(0, 3)).toEqual([
    ['travel', { personalizationParams: PERSONALIZATION_PARAMS }],
    ['b2b-content', { personalizationParams: PERSONALIZATION_PARAMS }],
    ['media', { personalizationParams: PERSONALIZATION_PARAMS }],
  ])
})
