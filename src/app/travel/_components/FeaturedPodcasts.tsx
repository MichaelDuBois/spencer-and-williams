'use client'

import { useSetAtom } from 'jotai'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Configure, Hits, Index } from 'react-instantsearch'

import { getPodcastHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import { TravelPodcastEpisodeCard } from '@/app/travel/search/_components/TravelPodcastEpisodeCard'
import { isFromHomePageAtom } from '@/stores/travel'

export const FeaturedPodcasts = () => {
  const setIsFromHomePage = useSetAtom(isFromHomePageAtom)
  const { algolia, slug } = travelConfig
  const podcastIndex = algolia.indices.podcasts

  if (!podcastIndex.template) return null

  const podcastHitTemplate = podcastIndex.template

  return (
    <section className="mb-16">
      <Index indexName={podcastIndex.name} indexId="homepage_podcasts">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold">
              Travel Podcasts
            </h2>
            <p className="text-muted-foreground mt-1">
              Listen to stories from fellow travelers
            </p>
          </div>
          <Link
            href={`/${slug}/search`}
            className="text-accent group flex items-center gap-1.5 text-sm font-medium"
            onClick={() => setIsFromHomePage(true)}>
            <span className="transition-transform group-hover:-translate-x-0.5">
              View all
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <Configure hitsPerPage={6} query="" />
        <Hits
          hitComponent={({ hit }) => (
            <TravelPodcastEpisodeCard
              episode={getPodcastHitValues(hit, podcastHitTemplate, slug)}
              hit={hit}
              template={podcastHitTemplate}
            />
          )}
          classNames={{
            list: 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch',
            item: 'h-full',
          }}
        />
      </Index>
    </section>
  )
}
