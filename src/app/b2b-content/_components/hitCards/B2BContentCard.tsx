'use client'

import { Tag } from 'lucide-react'
import Link from 'next/link'
import { Highlight } from 'react-instantsearch'

import { Image } from '@/components/image/Image'
import { trackContentClick } from '@/lib/analytics/content-events'
import type { ContentType } from '@/lib/analytics/track'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

interface B2BContentCardProps {
  hit: AlgoliaHit<BaseHit>
  title: string
  titleAttribute: string
  contentType: ContentType
  indexName: string
  image?: string
  href?: string
  badge?: string | null
  children?: React.ReactNode
  disableHighlight?: boolean
}

export const B2BContentCard = ({
  hit,
  title,
  titleAttribute,
  contentType,
  indexName,
  image,
  href,
  badge,
  children,
  disableHighlight = false,
}: B2BContentCardProps) => {
  const card = (
    <article className="bg-card border-border rounded-card flex h-full flex-col overflow-hidden border transition-shadow hover:shadow-md">
      <div className="bg-muted relative h-40 w-full shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
        {image && (
          <div
            className="bg-accent/80 absolute inset-0 mix-blend-color"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {badge && (
          <div className="mb-3">
            <span className="bg-accent/10 text-accent rounded-badge flex w-fit items-center gap-1 px-2 py-0.5 text-xs font-medium">
              <Tag className="h-3 w-3" />
              {badge}
            </span>
          </div>
        )}

        <h3 className="text-card-foreground mb-4 line-clamp-2 flex-1 text-sm leading-snug font-semibold">
          {disableHighlight ? (
            title
          ) : (
            <Highlight hit={hit} attribute={titleAttribute} />
          )}
        </h3>

        {children}
      </div>
    </article>
  )

  if (!href) return card

  return (
    <Link
      href={href}
      className="block h-full"
      onClick={() => trackContentClick(hit, { contentType, index: indexName })}>
      {card}
    </Link>
  )
}
