import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { EcommerceProductHitValues } from '@/app/ecommerce/hitValues.types'
import { useSingleIndexSearch } from '@/features/aiAssistant/hooks/search/useSingleIndexSearch'
import { usePersonalizationSearchParams } from '@/hooks/usePersonalizationSearchParams'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  personalizationStore,
  resetPersonalizationAtom,
  setPersonaModeAtom,
  setRealtimeModeAtom,
} from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'
import type { Persona, VerticalConfig } from '@/types'

import { GROUP_0 } from '@tests/helpers/customerGroups'

import type { ReactNode } from 'react'

const REALTIME_FILTERS = ['category:Shoes<score=3>']

vi.mock('@/hooks/useRealtimeProfile', () => {
  return {
    useRealtimeProfile: (token: string) => {
      return { data: token ? REALTIME_FILTERS : undefined }
    },
  }
})

const PERSONA: Persona = {
  type: 'persona',
  id: 'runner',
  label: 'Runner',
  description: 'Likes running gear',
  token: 'persona-runner',
  affinities: { brand: ['Nike'] },
  optionalFilters: ['brand:Nike<score=5>', 'category:Running<score=2>'],
}

const buildConfig = (isPersonalizationEnabled = true): VerticalConfig => ({
    slug: 'ecommerce',
    algolia: {
      primaryIndex: {
        name: 'products',
        template: { attributes: { name: 'name', price: 'price' } },
      },
    },
    features: { personalization: { enabled: isPersonalizationEnabled } },
  } as unknown as VerticalConfig)

const extractor = (item: Record<string, unknown>): EcommerceProductHitValues => {
  return {
    objectID: String(item.objectID),
    productUrl: `/ecommerce/product/${String(item.objectID)}`,
    name: String(item.name ?? ''),
    price: typeof item.price === 'number' ? item.price : undefined,
  }
}

const renderSearch = ({
  search,
  isPersonalizationEnabled = true,
  filters,
  withPersonalization = true,
}: {
  search: ReturnType<typeof vi.fn>
  isPersonalizationEnabled?: boolean
  filters?: string
  withPersonalization?: boolean
}) => {
  const store = createStore()
  store.set(activeConfigAtom, buildConfig(isPersonalizationEnabled))
  store.set(baseSearchClientAtom, { search } as never)
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )

  return renderHook(
    () => {
      const personalizationParams = usePersonalizationSearchParams()
      return useSingleIndexSearch({
        extractor,
        queryOptions: filters ? { filters } : undefined,
        personalizationParams: withPersonalization
          ? personalizationParams
          : undefined,
      })
    },
    { wrapper },
  )
}

const HIT = { objectID: 'a', name: 'Shoe', price: 10 }

const paramsOf = (search: ReturnType<typeof vi.fn>, call: number) =>
  search.mock.calls[call][0][0].params

describe('useSingleIndexSearch — personalization', () => {
  afterEach(() => {
    personalizationStore.set(resetPersonalizationAtom)
  })

  it('sends userToken, enablePersonalization and optionalFilters for a persona', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const search = vi.fn().mockResolvedValue({ results: [{ hits: [HIT] }] })
    const { result } = renderSearch({ search })

    await result.current([{ query: 'shoes' }])

    expect(paramsOf(search, 0)).toEqual({
      clickAnalytics: true, hitsPerPage: 10,
      userToken: 'persona-runner',
      enablePersonalization: true,
      optionalFilters: PERSONA.optionalFilters,
      getRankingInfo: true,
    })
  })

  it('sends no persona params when the caller passes none', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const search = vi.fn().mockResolvedValue({ results: [{ hits: [HIT] }] })
    const { result } = renderSearch({ search, withPersonalization: false })

    await result.current([{ query: 'shoes' }])

    expect(paramsOf(search, 0)).toEqual({ clickAnalytics: true, hitsPerPage: 10 })
  })

  it('sends enablePersonalization false and no token or optionalFilters when anonymous', async () => {
    const search = vi.fn().mockResolvedValue({ results: [{ hits: [HIT] }] })
    const { result } = renderSearch({ search })

    await result.current([{ query: 'shoes' }])

    const params = paramsOf(search, 0)
    expect(params).toEqual({ clickAnalytics: true, hitsPerPage: 10, enablePersonalization: false })
    expect(params).not.toHaveProperty('userToken')
    expect(params).not.toHaveProperty('optionalFilters')
  })

  it('omits enablePersonalization when the vertical has personalization disabled', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const search = vi.fn().mockResolvedValue({ results: [{ hits: [HIT] }] })
    const { result } = renderSearch({ search, isPersonalizationEnabled: false })

    await result.current([{ query: 'shoes' }])

    expect(paramsOf(search, 0)).toEqual({
      clickAnalytics: true, hitsPerPage: 10,
      userToken: 'persona-runner',
    })
  })

  it('sends the token but no re-rank for a customer group, like the main search', async () => {
    personalizationStore.set(setPersonaModeAtom, GROUP_0)
    const search = vi.fn().mockResolvedValue({ results: [{ hits: [HIT] }] })
    const { result } = renderSearch({ search })

    await result.current([{ query: 'drill' }])

    expect(paramsOf(search, 0)).toEqual({
      clickAnalytics: true, hitsPerPage: 10,
      userToken: GROUP_0.token,
      enablePersonalization: false,
    })
  })

  it('sends the realtime session token and realtime optionalFilters', async () => {
    personalizationStore.set(setRealtimeModeAtom)
    const search = vi.fn().mockResolvedValue({ results: [{ hits: [HIT] }] })
    const { result } = renderSearch({ search })

    await result.current([{ query: 'shoes' }])

    const params = paramsOf(search, 0)
    expect(params.userToken).toMatch(/^realtime-/)
    expect(params.enablePersonalization).toBe(true)
    expect(params.optionalFilters).toEqual(REALTIME_FILTERS)
  })

  it('keeps hard filters alongside optionalFilters', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const search = vi.fn().mockResolvedValue({ results: [{ hits: [HIT] }] })
    const { result } = renderSearch({ search, filters: 'inStock:true' })

    await result.current([{ query: 'shoes', filters: 'brand:"Adidas"' }])

    const params = paramsOf(search, 0)
    expect(params.filters).toBe('brand:"Adidas" AND inStock:true')
    expect(params.optionalFilters).toEqual(PERSONA.optionalFilters)
  })

  it.each(['empty', 'rejected'])(
    'keeps personalization and baseline filters on the %s fallback retry',
    async (failure) => {
      personalizationStore.set(setPersonaModeAtom, PERSONA)
      const search = vi.fn().mockResolvedValue({ results: [{ hits: [HIT] }] })
      if (failure === 'empty') {
        search.mockResolvedValueOnce({ results: [{ hits: [] }] })
      } else {
        search.mockRejectedValueOnce(new Error('Invalid filters'))
      }
      const { result } = renderSearch({ search, filters: 'inStock:true' })

      await result.current([{ query: 'shoes', filters: 'brand:"Nope"' }])

      expect(search).toHaveBeenCalledTimes(2)
      expect(paramsOf(search, 1)).toEqual({
        clickAnalytics: true, hitsPerPage: 10,
        filters: 'inStock:true',
        userToken: 'persona-runner',
        enablePersonalization: true,
        optionalFilters: PERSONA.optionalFilters,
        getRankingInfo: true,
      })
    },
  )
})
