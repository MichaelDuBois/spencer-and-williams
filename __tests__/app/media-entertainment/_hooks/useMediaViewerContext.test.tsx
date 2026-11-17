import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaViewerContext } from '@/app/media-entertainment/_hooks/useMediaViewerContext'
import type { MediaSearchRequest } from '@/app/media-entertainment/_utils/buildRailRequests'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import {
  isAIAssistantOpenState,
  viewerContextState,
} from '@/features/aiAssistant/stores/aiAssistant'
import { getMediaWatchStateAtom } from '@/stores/mediaWatchState'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
  realtimeSessionTokenAtom,
} from '@/stores/personalization'
import {
  baseSearchClientAtom,
  searchClientAtom,
  searchClientKeyAtom,
} from '@/stores/searchClient'
import type { Persona } from '@/types'

import {
  buildProvidersWrapper,
  createMockSearchClient,
} from '@tests/helpers/test-utils'

vi.mock('@/hooks/useInsightsEvents', () => {
  return {
    useInsightsEvents: () => {
      return { sendConversionEvent: vi.fn() }
    },
  }
})

const NOW = 1_700_000_000_000

const watchStateAtom = getMediaWatchStateAtom(mediaEntertainmentConfig.slug)

const PERSONA: Persona = {
  id: 'cinephile',
  label: 'Cinephile',
  description: 'watches everything twice',
  token: 'cinephile-token',
  affinities: { genres: ['Drama'] },
  optionalFilters: [],
}

const INDEX_TITLES: Record<string, Record<string, unknown>> = {
  movie_1: {
    objectID: 'movie_1',
    title: 'Zootopia',
    record_type: 'movie',
    release_date_str: '2016',
  },
  movie_2: {
    objectID: 'movie_2',
    title: 'Ratatouille',
    record_type: 'movie',
    release_date_str: '2007',
  },
}

/** Answers with whichever fixtures the request's objectID filter asks for. */
const searchByObjectIdFilter = (requests: MediaSearchRequest[]) => {
  const filters = requests[0].params.filters ?? ''

  return Promise.resolve({
    results: [
      {
        hits: Object.entries(INDEX_TITLES)
          .filter(([objectID]) => filters.includes(`"${objectID}"`))
          .map(([, hit]) => hit),
      },
    ],
  })
}

const setMyList = (
  store: ReturnType<typeof buildProvidersWrapper>['store'],
  objectIDs: string[],
) => {
  store.set(watchStateAtom, {
    cinephile: {
      myList: objectIDs.map((objectID, index) => {
        return {
          objectID,
          addedAt: NOW + index,
        }
      }),
      continueWatching: [],
    },
  })
}

const renderViewerContext = () => {
  const searchMock = vi.fn(searchByObjectIdFilter)
  const { Wrapper, store } = buildProvidersWrapper()

  const client = createMockSearchClient({ search: searchMock })

  // Both atoms: the viewer context reads index metadata off the base client,
  // while the watch rails resolve titles through whichever client is installed.
  store.set(baseSearchClientAtom, client)
  store.set(searchClientAtom, client)
  store.set(searchClientKeyAtom, 'standard')
  personalizationStore.set(activePersonaAtom, PERSONA)
  setMyList(store, ['movie_1'])

  const view = renderHook(() => useMediaViewerContext(), { wrapper: Wrapper })

  return { ...view, store, searchMock }
}

describe('useMediaViewerContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
    // The personalization atoms live on the global store, so reset them here.
    personalizationStore.set(activePersonaAtom, null)
    personalizationStore.set(realtimePersoEnabledAtom, false)
    personalizationStore.set(realtimeSessionTokenAtom, '')
  })

  it('publishes the persona note without a request while the panel is closed', async () => {
    const { store, searchMock } = renderViewerContext()

    await waitFor(() => expect(store.get(viewerContextState)).not.toBeNull())

    const context = store.get(viewerContextState)
    expect(context).toContain('Cinephile')
    expect(context).not.toContain('Zootopia')
    expect(searchMock).not.toHaveBeenCalled()
  })

  it('resolves the list titles once the assistant opens', async () => {
    const { store, searchMock } = renderViewerContext()

    await waitFor(() => expect(store.get(viewerContextState)).not.toBeNull())

    act(() => store.set(isAIAssistantOpenState, true))

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(store.get(viewerContextState)).toContain('Zootopia'),
    )
  })

  // The latch, not the raw open flag: once the assistant has been used, the note
  // has to keep up with the lists while the panel is shut, or the next turn talks
  // about a list the viewer changed two pages ago.
  it('keeps resolving titles added after the assistant closes again', async () => {
    const { store, searchMock } = renderViewerContext()

    act(() => store.set(isAIAssistantOpenState, true))
    await waitFor(() =>
      expect(store.get(viewerContextState)).toContain('Zootopia'),
    )

    act(() => store.set(isAIAssistantOpenState, false))

    // Nothing is cleared or refetched by the close itself.
    expect(store.get(viewerContextState)).toContain('Zootopia')
    expect(searchMock).toHaveBeenCalledTimes(1)

    act(() => setMyList(store, ['movie_1', 'movie_2']))

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(2))
    await waitFor(() =>
      expect(store.get(viewerContextState)).toContain('Ratatouille'),
    )
    expect(store.get(viewerContextState)).toContain('Zootopia')
  })

  it('clears the published note on unmount', async () => {
    const { store, unmount } = renderViewerContext()

    await waitFor(() => expect(store.get(viewerContextState)).not.toBeNull())

    unmount()

    expect(store.get(viewerContextState)).toBeNull()
  })
})
