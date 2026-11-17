'use client'

import { useParams } from 'next/navigation'

import { B2BContentAiSummary } from '@/app/b2b-content/_components/B2BContentAiSummary'
import { ContentPDPStructuredBody } from '@/app/b2b-content/_components/pdpComponents/ContentPDPStructuredBody'
import { getB2BContentResourceHitValues } from '@/app/b2b-content/_utils/getB2BContentHitValues'
import { b2bContentConfig } from '@/app/b2b-content/config'
import {
  B2BResourceCta,
  B2BResourceHeader,
  B2BResourceHeroImage,
  B2BResourcePills,
} from '@/app/b2b-content/resources/[id]/_components'
import { PdpLoadingState } from '@/components/pdp/PdpLoadingState'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { useExtractedHit } from '@/hooks/useExtractedHit'

const template = b2bContentConfig.algolia.indices.resources.template!

const ResourcePage = () => {
  const params = useParams()
  const id = decodeURIComponent(String(params.id ?? ''))
  const { slug } = b2bContentConfig

  const {
    data: resource,
    isLoading,
    isError,
  } = useExtractedHit(id, {
    template,
    extractor: getB2BContentResourceHitValues,
    indexName: b2bContentConfig.algolia.indices.resources.name,
  })

  if (isLoading) {
    return <PdpLoadingState />
  }

  if (isError || !resource) {
    return (
      <PdpNotFoundState
        title="Resource not found"
        backHref={`/${slug ?? 'b2b-content'}/search/resources`}
        backLabel="Back to resources"
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <B2BResourceHeader resource={resource} />
      <B2BResourcePills resource={resource} />
      <B2BResourceHeroImage resource={resource} />
      <B2BContentAiSummary resource={resource} />
      <ContentPDPStructuredBody blocks={resource.body} />
      <B2BResourceCta resource={resource} />
    </div>
  )
}

export default ResourcePage
