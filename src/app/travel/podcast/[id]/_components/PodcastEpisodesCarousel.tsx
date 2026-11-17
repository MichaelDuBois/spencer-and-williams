'use client'

import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { TravelPodcastEpisodeCard } from '@/app/travel/search/_components/TravelPodcastEpisodeCard'
import { Carousel } from '@/components/Carousel'

interface PodcastEpisodesCarouselProps {
  episodes: PodcastHitValues[]
  isLoading?: boolean
}

export const PodcastEpisodesCarousel = ({
  episodes,
  isLoading = false,
}: PodcastEpisodesCarouselProps) => {
  if (isLoading) {
    return (
      <Carousel>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-muted rounded-card h-40 w-80 shrink-0 animate-pulse"
          />
        ))}
      </Carousel>
    )
  }

  if (!episodes.length) return null

  return (
    <Carousel>
      {episodes.map((episode) => (
        <div key={episode.objectID} className="w-152 min-w-0 shrink-0">
          <TravelPodcastEpisodeCard episode={episode} />
        </div>
      ))}
    </Carousel>
  )
}
