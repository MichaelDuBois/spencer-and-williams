'use client'

import { Layers } from 'lucide-react'

import { B2BContentCard } from '@/app/b2b-content/_components/hitCards/B2BContentCard'
import { getB2BContentResourceHitValues } from '@/app/b2b-content/_utils/getB2BContentHitValues'
import { getIndexConfig } from '@/app/b2b-content/_utils/getIndexConfig'
import { b2bContentConfig } from '@/app/b2b-content/config'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

interface ResourceHitProps {
  hit: AlgoliaHit<BaseHit>
}

const resourceIndex = getIndexConfig('resources')
const template = resourceIndex.template!

export const ResourceHit = ({ hit }: ResourceHitProps) => {
  const { title, docType, relatedProducts, image } =
    getB2BContentResourceHitValues(hit, template, b2bContentConfig.slug)

  const tags = relatedProducts ?? []

  return (
    <B2BContentCard
      hit={hit}
      title={title}
      titleAttribute={template.attributes.title}
      contentType="resource"
      indexName={resourceIndex.name}
      image={image}
      href={`/${b2bContentConfig.slug}/resources/${encodeURIComponent(hit.objectID)}`}
      badge={docType}>
      {tags.length > 0 && (
        <div className="text-muted-foreground flex flex-wrap items-center gap-1.5">
          <Layers className="h-3 w-3 shrink-0" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="border-border rounded-badge border px-1.5 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </B2BContentCard>
  )
}
