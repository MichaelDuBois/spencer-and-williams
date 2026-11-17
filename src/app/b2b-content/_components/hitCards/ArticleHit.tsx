'use client'

import { ChevronRight, Clock, LifeBuoy, Pin } from 'lucide-react'
import Link from 'next/link'
import { Highlight } from 'react-instantsearch'

import {
  collapseBlocks,
  getB2BContentArticleHitValues,
} from '@/app/b2b-content/_utils/getB2BContentHitValues'
import { b2bContentConfig } from '@/app/b2b-content/config'
import { OutdatedBadge } from '@/components/badge/OutdatedBadge'
import { trackContentClick } from '@/lib/analytics/content-events'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

interface ArticleHitProps {
  hit: AlgoliaHit<BaseHit>
}

export const ArticleHit = ({ hit }: ArticleHitProps) => {
  const template = b2bContentConfig.algolia.indices.articles.template!
  const { body, category, section, updatedAt, promoted, outdated } =
    getB2BContentArticleHitValues(hit, template, b2bContentConfig.slug)
  const bodyText = collapseBlocks(body)

  return (
    <Link
      href={`/${b2bContentConfig.slug}/articles/${encodeURIComponent(hit.objectID)}`}
      className="block"
      onClick={() =>
        trackContentClick(hit, {
          contentType: 'article',
          index: b2bContentConfig.algolia.indices.articles.name,
        })
      }>
      <article className="group hover:bg-muted/40 flex gap-4 px-2 py-4 transition-colors">
        <div
          className="bg-accent/10 text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          aria-hidden="true">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-foreground group-hover:text-accent min-w-0 flex-1 truncate text-base font-semibold transition-colors">
              <Highlight hit={hit} attribute={template.attributes.title} />
            </h3>
            {promoted && (
              <span className="bg-accent/10 text-accent inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                <Pin className="h-3 w-3" />
                Featured
              </span>
            )}
            {outdated && <OutdatedBadge className="shrink-0" />}
          </div>
          {bodyText && (
            <p className="text-muted-foreground mb-2 line-clamp-2 text-sm leading-relaxed">
              {bodyText}
            </p>
          )}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {(category || section) && (
              <span className="flex items-center gap-1 font-bold tracking-wide uppercase">
                {category && <span className="truncate">{category}</span>}
                {category && section && (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                )}
                {section && <span className="truncate">{section}</span>}
              </span>
            )}
            {(category || section) && updatedAt && (
              <span aria-hidden="true">·</span>
            )}
            {updatedAt && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-3.5 w-3.5" />
                Updated {updatedAt}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
