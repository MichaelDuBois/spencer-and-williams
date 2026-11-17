'use client'

import { Play } from 'lucide-react'
import Link from 'next/link'

import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { TravelPodcastContent } from '@/app/travel/search/_components/TravelPodcastContent'

interface TravelPodcastEpisodeCardProps {
  episode: PodcastHitValues
}

export const TravelPodcastEpisodeCard = ({
  episode,
}: TravelPodcastEpisodeCardProps) => (
  <Link href={episode.productUrl} className="group block h-full">
    <article className="bg-muted/30 border-border hover:border-accent/30 hover:bg-muted/50 rounded-card flex h-full gap-4 border p-4 transition-all duration-200">
      <div className="min-w-0 flex-1">
        <TravelPodcastContent values={episode} />
      </div>
      <div className="border-border group-hover:border-accent group-hover:bg-accent hidden h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border transition-all group-hover:text-white sm:flex">
        <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
      </div>
    </article>
  </Link>
)
