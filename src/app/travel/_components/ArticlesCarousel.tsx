import { useHits } from 'react-instantsearch'

import { ArticleCard } from '@/app/travel/_components/ArticleCard'
import { Carousel } from '@/components/Carousel'

import type { BaseHit, Hit as AlgoliaHit } from 'instantsearch.js'

export const ArticlesCarousel = () => {
  const { items } = useHits<AlgoliaHit<BaseHit>>()

  if (!items.length) return null

  return (
    <Carousel>
      {items.map((hit) => (
        <div key={hit.objectID} className="w-80 shrink-0">
          <ArticleCard hit={hit} />
        </div>
      ))}
    </Carousel>
  )
}
