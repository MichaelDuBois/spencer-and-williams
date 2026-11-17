'use client'

import { useParams } from 'next/navigation'

import { useGetOtherPodcastEpisodes } from '@/app/travel/_hooks/useGetOtherPodcastEpisodes'
import { getPodcastHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import { TravelPodcastPageContent } from '@/app/travel/podcast/[id]/_components'
import { PdpLoadingState } from '@/components/pdp/PdpLoadingState'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { useSetProductContext } from '@/features/aiAssistant/hooks/useSetProductContext'
import { travelContentContextState } from '@/features/aiAssistant/stores/aiAssistant'
import { useExtractedHit } from '@/hooks/useExtractedHit'

const TravelPodcastPage = () => {
  const params = useParams()
  const podcastId = params.id as string
  const { slug, algolia } = travelConfig
  const podcastTemplate = algolia.indices.podcasts.template

  const {
    data: podcast,
    isLoading,
    isError,
  } = useExtractedHit(podcastId ?? '', {
    template: podcastTemplate,
    extractor: getPodcastHitValues,
    indexName: algolia.indices.podcasts.name,
  })

  const { data: otherEpisodes = [], isLoading: isOtherEpisodesLoading } =
    useGetOtherPodcastEpisodes(podcast)

  useSetProductContext(
    travelContentContextState,
    podcast ? { contentType: 'podcast', record: podcast } : null,
  )

  if (isLoading) {
    return <PdpLoadingState />
  }

  if (isError || !podcast) {
    return (
      <PdpNotFoundState
        eyebrow="Episode unavailable"
        title="We couldn't find that travel podcast episode."
        backHref={`/${slug ?? 'travel'}/search`}
        backLabel="Back to travel search"
      />
    )
  }

  return (
    <TravelPodcastPageContent
      podcast={podcast}
      otherEpisodes={otherEpisodes}
      isOtherEpisodesLoading={isOtherEpisodesLoading}
    />
  )
}

export default TravelPodcastPage
