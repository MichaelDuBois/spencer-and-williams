'use client'

import Link from 'next/link'
import { Highlight } from 'react-instantsearch'

import { getB2BContentDocumentationHitValues } from '@/app/b2b-content/_utils/getB2BContentHitValues'
import { getDocumentationTypeIcon } from '@/app/b2b-content/_utils/getDocumentationTypeIcon'
import { b2bContentConfig } from '@/app/b2b-content/config'
import { trackContentClick } from '@/lib/analytics/content-events'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

interface DocumentationHitProps {
  hit: AlgoliaHit<BaseHit>
}

export const DocumentationHit = ({ hit }: DocumentationHitProps) => {
  const template = b2bContentConfig.algolia.primaryIndex.template!
  const { docType, category } = getB2BContentDocumentationHitValues(
    hit,
    template,
    b2bContentConfig.slug,
  )

  return (
    <Link
      href={`/${b2bContentConfig.slug}/documentation/${encodeURIComponent(hit.objectID)}`}
      className="block"
      onClick={() =>
        trackContentClick(hit, {
          contentType: 'documentation',
          index: b2bContentConfig.algolia.primaryIndex.name,
        })
      }>
      <article className="group hover:bg-muted/40 flex gap-4 px-2 py-4 transition-colors">
        <div
          className="bg-accent/10 text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          aria-hidden="true">
          {getDocumentationTypeIcon(docType, { className: 'h-5 w-5' })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-foreground group-hover:text-accent min-w-0 flex-1 truncate text-base font-semibold transition-colors">
              <Highlight hit={hit} attribute={template.attributes.title} />
            </h3>
            {docType && (
              <span className="bg-accent/10 text-accent inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium">
                {docType}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm leading-relaxed">
            <Highlight hit={hit} attribute={template.attributes.description} />
          </p>
          {category && (
            <div className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
              {category}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
