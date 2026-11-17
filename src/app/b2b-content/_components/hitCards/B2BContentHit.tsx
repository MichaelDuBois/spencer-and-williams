'use client'

import { ArticleHit } from '@/app/b2b-content/_components/hitCards/ArticleHit'
import { BlogHit } from '@/app/b2b-content/_components/hitCards/BlogHit'
import { DocumentationHit } from '@/app/b2b-content/_components/hitCards/DocumentationHit'
import { ResourceHit } from '@/app/b2b-content/_components/hitCards/ResourceHit'
import type { B2BContentIndexKey } from '@/app/b2b-content/types'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

interface B2BContentHitProps {
  hit: AlgoliaHit<BaseHit>
  indexKey: B2BContentIndexKey
}

export const B2BContentHit = ({ hit, indexKey }: B2BContentHitProps) => {
  switch (indexKey) {
    case 'documentation':
      return <DocumentationHit hit={hit} />
    case 'blogs':
      return <BlogHit hit={hit} />
    case 'articles':
      return <ArticleHit hit={hit} />
    case 'resources':
      return <ResourceHit hit={hit} />
  }
}
