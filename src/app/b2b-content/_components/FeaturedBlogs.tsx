'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Configure, Index, useHits } from 'react-instantsearch'

import { BlogHit } from '@/app/b2b-content/_components/hitCards/BlogHit'
import { b2bContentConfig as config } from '@/app/b2b-content/config'
import { Carousel } from '@/components/Carousel'

import type { BaseHit, Hit as AlgoliaHit } from 'instantsearch.js'

const basePath = `/${config.slug}`

const FeaturedBlogsCarousel = () => {
  const { items } = useHits<AlgoliaHit<BaseHit>>()

  if (!items.length) return null

  return (
    <Carousel>
      {items.map((hit) => (
        <div key={hit.objectID} className="w-72 shrink-0">
          <BlogHit hit={hit} />
        </div>
      ))}
    </Carousel>
  )
}

export const FeaturedBlogs = () => (
  <section className="mb-16">
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-foreground text-2xl font-bold">Featured Blogs</h2>
        <p className="text-muted-foreground mt-1">
          Read the latest blogs from our team
        </p>
      </div>
      <Link
        href={`${basePath}/search/blogs`}
        className="text-accent group flex items-center gap-1.5 text-sm font-medium">
        <span>View all</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>

    <Index
      indexName={config.algolia.indices.blogs.name}
      indexId="homepage_blogs">
      <Configure
        hitsPerPage={12}
        ruleContexts={config.homepageCarousels?.[0]?.ruleContexts}
      />
      <FeaturedBlogsCarousel />
    </Index>
  </section>
)
