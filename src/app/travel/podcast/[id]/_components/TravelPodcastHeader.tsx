import { CalendarDays, Clock3, Headphones } from 'lucide-react'

import { TravelAiSummary } from '@/app/travel/_components/TravelAiSummary'
import {
  formatDate,
  formatDisplayLabel,
} from '@/app/travel/_utils/travelContentFormatters'
import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { TravelPodcastStatsPanel } from '@/app/travel/podcast/[id]/_components/TravelPodcastStatsPanel'
import { TravelPodcastTags } from '@/app/travel/podcast/[id]/_components/TravelPodcastTags'
import { getOrderedSpeakerNames } from '@/app/travel/podcast/[id]/_utils/transcriptHelpers'
import { Image } from '@/components/image/Image'

export const TravelPodcastHeader = ({
  podcast,
}: {
  podcast: PodcastHitValues
}) => {
  const categoryLabel = podcast.category
    ? formatDisplayLabel(podcast.category)
    : 'Travel Podcast'
  const episodeTitle = podcast.episode || podcast.title
  const formattedEpisodeNumber =
    podcast.episodeNumber !== undefined
      ? String(podcast.episodeNumber).padStart(2, '0')
      : null
  const speakerNames = getOrderedSpeakerNames({
    hosts: podcast.hosts,
    guests: podcast.guests,
  })
  const speakerLabel = speakerNames.length
    ? speakerNames.join(', ')
    : 'Spencer & Williams'

  return (
    <header className="mx-auto max-w-6xl">
      <p className="text-accent text-xs font-medium tracking-[0.35em] uppercase">
        {categoryLabel}
      </p>

      <div className="mt-5 grid gap-6 md:gap-8 lg:grid-cols-[minmax(17rem,19.5rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <div className="relative mx-auto w-full max-w-[19.5rem] lg:mx-0">
          <div className="bg-muted shadow-accent/10 relative aspect-square overflow-hidden rounded-2xl shadow-lg">
            <Image
              src={podcast.image}
              alt={episodeTitle}
              fill
              sizes="(max-width: 1024px) min(80vw, 19.5rem), 19.5rem"
              className="object-cover"
              fallback={
                <div className="bg-accent/10 flex h-full items-center justify-center">
                  <Headphones className="text-accent/60 h-12 w-12" />
                </div>
              }
            />
          </div>

          {formattedEpisodeNumber && (
            <span className="border-border bg-background/92 text-accent rounded-badge text-micro absolute top-3 left-3 inline-flex border px-3 py-1 font-semibold tracking-[0.18em] uppercase shadow-sm backdrop-blur-sm">
              Episode {formattedEpisodeNumber}
            </span>
          )}
        </div>

        <div className="min-w-0 self-center lg:pt-2">
          <p className="text-accent text-[0.72rem] font-semibold tracking-[0.28em] uppercase">
            {podcast.title}
          </p>
          <h1 className="text-foreground mt-3 text-3xl leading-[0.95] font-light tracking-tight text-balance md:text-5xl lg:text-[4rem]">
            {episodeTitle}
          </h1>
          {podcast.summary && (
            <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-7 md:text-[1.08rem] md:leading-8">
              {podcast.summary}
            </p>
          )}

          <div className="border-border/70 mt-6 flex flex-col gap-3 border-t pt-5 md:flex-row md:items-center md:justify-between md:gap-6">
            <p className="text-muted-foreground min-w-0 text-sm leading-6 md:flex-1">
              <span className="text-foreground font-medium">Speakers:</span>{' '}
              {speakerLabel}
            </p>

            <div className="text-muted-foreground flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 text-sm md:justify-end">
              {podcast.publishedAt && (
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(podcast.publishedAt)}
                </span>
              )}
              {podcast.duration !== undefined && (
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {podcast.duration} min listen
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {podcast.tags && <TravelPodcastTags tags={podcast.tags} />}

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(14.5rem,15.5rem)_minmax(0,1fr)] lg:items-start">
        <TravelPodcastStatsPanel podcast={podcast} />
        <TravelAiSummary podcast={podcast} />
      </div>
    </header>
  )
}
