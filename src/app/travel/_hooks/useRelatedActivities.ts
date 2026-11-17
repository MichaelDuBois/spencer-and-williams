'use client'

import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { getActivityHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import type { ActivityHitValues } from '@/app/travel/hitValues.types'
import { searchClientAtom } from '@/stores/searchClient'
import type { RelatedActivityHit } from '@/types'
import { getObjectIdFilter } from '@/utilities/algoliaFilters'

interface UseRelatedActivitiesOptions {
  staleTime?: number
}

export const useRelatedActivities = (
  activityIds: string[],
  options: UseRelatedActivitiesOptions = {},
) => {
  const { staleTime = 1000 * 60 * 5 } = options
  const searchClient = useAtomValue(searchClientAtom)
  const { algolia, slug } = travelConfig
  const activitiesIndexConfig = algolia.indices.activities
  const activitiesIndex = activitiesIndexConfig.name
  const activitiesTemplate = activitiesIndexConfig.template

  return useQuery<ActivityHitValues[]>({
    queryKey: ['related-activities', slug, activitiesIndex, activityIds],
    queryFn: async () => {
      if (!searchClient || !activitiesIndex || !activitiesTemplate) {
        throw new Error(
          'Search client, activities index, or template not available',
        )
      }

      const results = await searchClient.search<RelatedActivityHit>(
        activityIds.map((activityId) => {
          return {
            indexName: activitiesIndex,
            params: {
              filters: getObjectIdFilter(activityId),
              hitsPerPage: 1,
            },
          }
        }),
      )

      return results.results
        .map((result) => ('hits' in result ? result.hits[0] : null))
        .filter((activity): activity is RelatedActivityHit => !!activity)
        .map((activity) =>
          getActivityHitValues(activity, activitiesTemplate, slug),
        )
    },
    enabled:
      !!searchClient &&
      !!activitiesIndex &&
      !!activitiesTemplate &&
      activityIds.length > 0,
    staleTime,
  })
}
