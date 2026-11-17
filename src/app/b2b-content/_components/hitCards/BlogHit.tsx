'use client'

import { Highlight } from 'react-instantsearch'

import { B2BContentCard } from '@/app/b2b-content/_components/hitCards/B2BContentCard'
import { getB2BContentBlogHitValues } from '@/app/b2b-content/_utils/getB2BContentHitValues'
import { getIndexConfig } from '@/app/b2b-content/_utils/getIndexConfig'
import { b2bContentConfig } from '@/app/b2b-content/config'
import { getByPath } from '@/utilities/getByPath'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

interface BlogHitProps {
  hit: AlgoliaHit<BaseHit>
  disableHighlight?: boolean
}

const blogIndex = getIndexConfig('blogs')
const template = blogIndex.template!

export const BlogHit = ({ hit, disableHighlight = false }: BlogHitProps) => {
  const { title, category, publishedAt, authorDisplay, image } =
    getB2BContentBlogHitValues(hit, template, b2bContentConfig.slug)

  return (
    <B2BContentCard
      hit={hit}
      title={title}
      titleAttribute={template.attributes.title}
      contentType="blog"
      indexName={blogIndex.name}
      image={image}
      href={`/${b2bContentConfig.slug}/blogs/${encodeURIComponent(hit.objectID)}`}
      badge={category}
      disableHighlight={disableHighlight}>
      <p className="text-muted-foreground mb-4 line-clamp-3 text-xs leading-relaxed">
        {disableHighlight ? (
          getByPath<string>(hit, template.attributes.description)
        ) : (
          <Highlight hit={hit} attribute={template.attributes.description} />
        )}
      </p>

      {(authorDisplay || publishedAt) && (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {authorDisplay && <span className="font-bold">{authorDisplay}</span>}
          {authorDisplay && publishedAt && <span aria-hidden="true">·</span>}
          {publishedAt && (
            <span className="whitespace-nowrap">{publishedAt}</span>
          )}
        </div>
      )}
    </B2BContentCard>
  )
}
