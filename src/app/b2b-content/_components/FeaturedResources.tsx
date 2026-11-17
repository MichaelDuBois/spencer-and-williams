'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Configure, Index, useHits } from 'react-instantsearch'

import { ResourceHit } from '@/app/b2b-content/_components/hitCards/ResourceHit'
import { b2bContentConfig as config } from '@/app/b2b-content/config'
import { Carousel } from '@/components/Carousel'

import type { BaseHit, Hit as AlgoliaHit } from 'instantsearch.js'

const basePath = `/${config.slug}`

const FeaturedResourcesCarousel = () => {
  const { items } = useHits<AlgoliaHit<BaseHit>>()

  if (!items.length) return null

  return (
    <Carousel>
      {items.map((hit) => (
        <div key={hit.objectID} className="w-72 shrink-0">
          <ResourceHit hit={hit} />
        </div>
      ))}
    </Carousel>
  )
}

export const FeaturedResources = () => (
  <section className="mb-16">
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-foreground text-2xl font-bold">
          Algolia Resources
        </h2>
        <p className="text-muted-foreground mt-1">
          Resources to help you get the most from Algolia products and solutions
        </p>
      </div>
      <Link
        href={`${basePath}/search/resources`}
        className="text-accent group flex items-center gap-1.5 text-sm font-medium">
        <span>View all</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>

    <Index
      indexName={config.algolia.indices.resources.name}
      indexId="homepage_resources">
      <Configure hitsPerPage={12} />
      <FeaturedResourcesCarousel />
    </Index>
  </section>
)
