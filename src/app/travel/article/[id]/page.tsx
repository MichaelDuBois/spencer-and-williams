'use client'

import { useParams } from 'next/navigation'

import { useRelatedActivities } from '@/app/travel/_hooks/useRelatedActivities'
import { getArticleHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { TravelArticlePageContent } from '@/app/travel/article/[id]/_components'
import { travelConfig } from '@/app/travel/config'
import { PdpLoadingState } from '@/components/pdp/PdpLoadingState'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { useSetProductContext } from '@/features/aiAssistant/hooks/useSetProductContext'
import { travelContentContextState } from '@/features/aiAssistant/stores/aiAssistant'
import { useExtractedHit } from '@/hooks/useExtractedHit'

const MAX_RELATED_ACTIVITIES = 4

const TravelArticlePage = () => {
  const params = useParams()
  const articleId = params.id as string
  const { slug, algolia } = travelConfig
  const articleTemplate = algolia.primaryIndex.template

  const {
    data: article,
    isLoading,
    isError,
  } = useExtractedHit(articleId ?? '', {
    template: articleTemplate,
    extractor: getArticleHitValues,
  })

  const {
    data: relatedActivities = [],
    isLoading: isRelatedActivitiesLoading,
  } = useRelatedActivities(
    article?.relatedActivities?.slice(0, MAX_RELATED_ACTIVITIES) ?? [],
  )

  useSetProductContext(
    travelContentContextState,
    article ? { contentType: 'article', record: article } : null,
  )

  if (isLoading) {
    return <PdpLoadingState />
  }

  if (isError || !article) {
    return (
      <PdpNotFoundState
        eyebrow="Article unavailable"
        title="We couldn't find that travel guide."
        backHref={`/${slug ?? 'travel'}/search`}
        backLabel="Back to travel search"
      />
    )
  }

  return (
    <TravelArticlePageContent
      article={article}
      relatedActivities={relatedActivities}
      isRelatedActivitiesLoading={isRelatedActivitiesLoading}
    />
  )
}

export default TravelArticlePage
