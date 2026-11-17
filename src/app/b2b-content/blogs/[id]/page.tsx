'use client'

import { useParams } from 'next/navigation'

import { B2BContentAiSummary } from '@/app/b2b-content/_components/B2BContentAiSummary'
import { ContentPDPStructuredBody } from '@/app/b2b-content/_components/pdpComponents/ContentPDPStructuredBody'
import { getB2BContentBlogHitValues } from '@/app/b2b-content/_utils/getB2BContentHitValues'
import {
  B2BBlogCta,
  B2BBlogHeader,
  B2BBlogHeroImage,
} from '@/app/b2b-content/blogs/[id]/_components'
import { b2bContentConfig } from '@/app/b2b-content/config'
import { PdpLoadingState } from '@/components/pdp/PdpLoadingState'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'
import { useExtractedHit } from '@/hooks/useExtractedHit'

const template = b2bContentConfig.algolia.indices.blogs.template!

const BlogPage = () => {
  const params = useParams()
  const id = decodeURIComponent(String(params.id ?? ''))
  const { slug } = b2bContentConfig

  const {
    data: blog,
    isLoading,
    isError,
  } = useExtractedHit(id, {
    template,
    extractor: getB2BContentBlogHitValues,
    indexName: b2bContentConfig.algolia.indices.blogs.name,
  })

  if (isLoading) {
    return <PdpLoadingState />
  }

  if (isError || !blog) {
    return (
      <PdpNotFoundState
        title="Blog not found"
        backHref={`/${slug ?? 'b2b-content'}/search/blogs`}
        backLabel="Back to blogs"
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <B2BBlogHeader blog={blog} />
      <B2BBlogHeroImage blog={blog} />
      <B2BContentAiSummary blog={blog} />
      <ContentPDPStructuredBody blocks={blog.body} />
      <B2BBlogCta blog={blog} />
    </div>
  )
}

export default BlogPage
