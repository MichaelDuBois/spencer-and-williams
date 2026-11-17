'use client'

import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { PodcastEpisodesCarousel } from '@/app/travel/podcast/[id]/_components/PodcastEpisodesCarousel'

export const TravelPodcastOtherEpisodes = ({
  podcast,
  otherEpisodes,
  isLoading,
}: {
  podcast: PodcastHitValues
  otherEpisodes: PodcastHitValues[]
  isLoading: boolean
}) => {
  if (!isLoading && otherEpisodes.length === 0) {
    return null
  }

  return (
    <section className="border-border mx-auto mt-16 max-w-6xl border-t pt-12">
      <div className="max-w-3xl">
        <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase">
          Keep listening
        </p>
        <p className="text-muted-foreground mt-3 text-base leading-7">
          More conversations from {podcast.title}, ready to explore next.
        </p>
      </div>

      <div className="mt-8">
        <PodcastEpisodesCarousel
          episodes={otherEpisodes}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
