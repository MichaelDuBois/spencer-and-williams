'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { getPodcastHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { searchClientAtom } from '@/stores/searchClient'
import type { TravelPodcastHit } from '@/types'

import type { SearchParamsObject } from 'algoliasearch'

// Extend SearchParamsObject to include disableNeuralSearch
interface ExtendedSearchParams extends SearchParamsObject {
  disableNeuralSearch?: boolean
}

export const useGetOtherPodcastEpisodes = (
  podcast: PodcastHitValues | null,
) => {
  const searchClient = useAtomValue(searchClientAtom)
  const { slug, algolia } = travelConfig

  const podcastsIndexConfig = algolia.indices.podcasts
  const podcastsIndex = podcastsIndexConfig.name
  const podcastHitTemplate = podcastsIndexConfig.template

  return useQuery<PodcastHitValues[]>({
    queryKey: ['podcast-other-episodes', podcastsIndex, podcast?.objectID],
    queryFn: async () => {
      if (!searchClient || !podcastsIndex || !podcast || !podcastHitTemplate) {
        throw new Error(
          'Search client, podcast index, or podcast data not available',
        )
      }

      const results = await searchClient.search<TravelPodcastHit>([
        {
          indexName: podcastsIndex,
          params: {
            query: podcast.title,
            hitsPerPage: 24,
            restrictSearchableAttributes: ['title'],
            typoTolerance: false,
            disableNeuralSearch: true,
          } as ExtendedSearchParams,
        },
      ])

      const firstResult = results.results[0]
      const hits = firstResult && 'hits' in firstResult ? firstResult.hits : []

      return hits
        .filter(
          (episode) =>
            episode.objectID !== podcast.objectID &&
            episode.title === podcast.title,
        )
        .map((episode) =>
          getPodcastHitValues(episode, podcastHitTemplate, slug),
        )
    },
    enabled:
      !!searchClient && !!podcastsIndex && !!podcastHitTemplate && !!podcast,
    staleTime: 1000 * 60 * 5,
  })
}
