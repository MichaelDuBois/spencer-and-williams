'use client'

import { Clock } from 'lucide-react'
import { Highlight } from 'react-instantsearch'

import type { ArticleHitValues } from '@/app/travel/hitValues.types'
import type { TravelArticleHitTemplate } from '@/app/travel/types'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

export interface TravelArticleContentProps {
  values: ArticleHitValues
  hit: AlgoliaHit<BaseHit>
  template: TravelArticleHitTemplate
}

export const TravelArticleContent = ({
  values,
  hit,
  template,
}: TravelArticleContentProps) => (
  <>
    {values.category && (
      <span className="text-accent mb-1.5 text-xs font-semibold tracking-wider uppercase">
        <Highlight attribute={template.attributes.category} hit={hit} />
      </span>
    )}
    <h3 className="text-foreground group-hover:text-accent line-clamp-2 text-xl leading-tight font-semibold transition-colors">
      <Highlight attribute={template.attributes.title} hit={hit} />
    </h3>
    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
      {values.subtitle}
    </p>
    {(values.author || values.date || values.readTime) && (
      <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        {values.author && (
          <>
            <span className="whitespace-nowrap">
              {'By '}
              <span className="text-foreground font-medium">
                {values.author}
              </span>
            </span>
            {(values.date || values.readTime) && <span>•</span>}
          </>
        )}
        {values.date && (
          <>
            <span className="whitespace-nowrap">{values.date}</span>
            {values.readTime && <span>•</span>}
          </>
        )}
        {values.readTime && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="h-3.5 w-3.5" />
            {values.readTime}
          </span>
        )}
      </div>
    )}
  </>
)
