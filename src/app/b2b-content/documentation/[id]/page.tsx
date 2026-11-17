'use client'

import { useParams } from 'next/navigation'

import { B2BContentAiSummary } from '@/app/b2b-content/_components/B2BContentAiSummary'
import { getB2BContentDocumentationHitValues } from '@/app/b2b-content/_utils/getB2BContentHitValues'
import { b2bContentConfig } from '@/app/b2b-content/config'
import {
  B2BDocumentationBody,
  B2BDocumentationCta,
  B2BDocumentationHeader,
  B2BDocumentationPills,
} from '@/app/b2b-content/documentation/[id]/_components'
import { PdpLoadingState } from '@/components/pdp/PdpLoadingState'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { useExtractedHit } from '@/hooks/useExtractedHit'

const template = b2bContentConfig.algolia.primaryIndex.template!

const DocumentationPage = () => {
  const params = useParams()
  const id = decodeURIComponent(String(params.id ?? ''))
  const { slug } = b2bContentConfig

  const {
    data: doc,
    isLoading,
    isError,
  } = useExtractedHit(id, {
    template,
    extractor: getB2BContentDocumentationHitValues,
  })

  if (isLoading) {
    return <PdpLoadingState />
  }

  if (isError || !doc) {
    return (
      <PdpNotFoundState
        title="Documentation not found"
        backHref={`/${slug ?? 'b2b-content'}/search/documentation`}
        backLabel="Back to documentation"
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <B2BDocumentationHeader doc={doc} />
      <B2BDocumentationPills doc={doc} />
      <B2BContentAiSummary documentation={doc} />
      <B2BDocumentationBody doc={doc} />
      <B2BDocumentationCta doc={doc} />
    </div>
  )
}

export default DocumentationPage
