import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import { PERSONAS } from '@/app/media-entertainment/personas'
import { useMediaEntertainmentSearch } from '@/features/aiAssistant/hooks/search/useMediaEntertainmentSearch'
import { usePersonalizationSearchParams } from '@/hooks/usePersonalizationSearchParams'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  personalizationStore,
  resetPersonalizationAtom,
  setPersonaModeAtom,
} from '@/stores/personalization'
import { baseSearchClientAtom } from '@/stores/searchClient'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper } from '@tests/helpers/test-utils'

vi.mock('@/hooks/useRealtimeProfile', () => {
  return {
    useRealtimeProfile: () => {
      return { data: undefined }
    },
  }
})

const PERSONA = PERSONAS.find(({ id }) => id === 'marvel-fan')!

const renderSearch = (
  isPersonalizationEnabled = true,
  search = vi.fn().mockResolvedValue({
    results: [{ hits: [{ objectID: '1', title: 'Title 1' }] }],
  }),
) => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, {
      ...mediaEntertainmentConfig,
      features: {
        ...mediaEntertainmentConfig.features,
        personalization: {
          enabled: isPersonalizationEnabled,
          personas: PERSONAS,
        },
      },
    })
    s.set(baseSearchClientAtom, { search } as never)
  })
  const { result } = renderHook(
    () =>
      useMediaEntertainmentSearch({
        personalizationParams: usePersonalizationSearchParams(),
      }),
    {
      wrapper: buildProvidersWrapper({ store }).Wrapper,
    },
  )
  return { search, run: () => result.current([{ query: 'superheroes' }]) }
}

const paramsOf = (search: ReturnType<typeof vi.fn>) =>
  search.mock.calls[0][0][0].params

describe('useMediaEntertainmentSearch — personalization', () => {
  afterEach(() => {
    personalizationStore.set(resetPersonalizationAtom)
  })

  it('sends the persona params alongside the baseline filters', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const { search, run } = renderSearch()

    await run()

    const params = paramsOf(search)
    expect(params).toMatchObject({
      hitsPerPage: 12,
      userToken: PERSONA.token,
      enablePersonalization: true,
      optionalFilters: PERSONA.optionalFilters,
      getRankingInfo: true,
    })
    expect(params.filters).toEqual(expect.any(String))
  })

  it('sends enablePersonalization false when no persona is active', async () => {
    const { search, run } = renderSearch()

    await run()

    const params = paramsOf(search)
    expect(params.enablePersonalization).toBe(false)
    expect(params).not.toHaveProperty('userToken')
    expect(params).not.toHaveProperty('optionalFilters')
  })

  it('sends only the token when the vertical has personalization disabled', async () => {
    personalizationStore.set(setPersonaModeAtom, PERSONA)
    const { search, run } = renderSearch(false)

    await run()

    const params = paramsOf(search)
    expect(params.userToken).toBe(PERSONA.token)
    expect(params).not.toHaveProperty('enablePersonalization')
    expect(params).not.toHaveProperty('optionalFilters')
  })
})
