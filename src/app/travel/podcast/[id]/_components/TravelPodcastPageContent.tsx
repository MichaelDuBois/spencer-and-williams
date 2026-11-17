import { travelConfig } from '@/app/travel/config'
import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { TravelPodcastBody } from '@/app/travel/podcast/[id]/_components/TravelPodcastBody'
import { TravelPodcastHeader } from '@/app/travel/podcast/[id]/_components/TravelPodcastHeader'
import { TravelPodcastOtherEpisodes } from '@/app/travel/podcast/[id]/_components/TravelPodcastOtherEpisodes'
import { BackToResults } from '@/components/BackToResults'

export const TravelPodcastPageContent = ({
  podcast,
  otherEpisodes,
  isOtherEpisodesLoading,
}: {
  podcast: PodcastHitValues
  otherEpisodes: PodcastHitValues[]
  isOtherEpisodesLoading: boolean
}) => {
  const { slug } = travelConfig

  return (
    <div className="from-secondary/80 bg-linear-to-b to-transparent">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <BackToResults
          fallbackHref={`/${slug}/search`}
          label="Back to travel search"
        />
        <TravelPodcastHeader podcast={podcast} />
        <TravelPodcastBody podcast={podcast} />
        <TravelPodcastOtherEpisodes
          podcast={podcast}
          otherEpisodes={otherEpisodes}
          isLoading={isOtherEpisodesLoading}
        />
      </div>
    </div>
  )
}
