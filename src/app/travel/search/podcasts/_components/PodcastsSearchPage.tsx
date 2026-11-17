'use client'

import { Headphones } from 'lucide-react'
import { Configure } from 'react-instantsearch'

import { getPodcastHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import { TravelPodcastEpisodeCard } from '@/app/travel/search/_components/TravelPodcastEpisodeCard'
import { TravelSearchListingPage } from '@/app/travel/search/_components/TravelSearchListingPage'

const { algolia } = travelConfig

export const PodcastsSearchPage = () => (
  <>
    <Configure hitsPerPage={12} />
    <TravelSearchListingPage
      title="Podcasts"
      icon={<Headphones className="text-accent h-5 w-5" />}
      entityName="podcasts"
      facets={algolia?.indices?.podcasts?.facets ?? []}
      hitComponent={(hit) => {
        const template = algolia?.indices?.podcasts?.template
        if (!template) return null
        return (
          <TravelPodcastEpisodeCard
            episode={getPodcastHitValues(hit, template, travelConfig.slug)}
            hit={hit}
            template={template}
          />
        )
      }}
      hitsClassNames={{ list: 'flex flex-col gap-3', item: '' }}
    />
  </>
)
