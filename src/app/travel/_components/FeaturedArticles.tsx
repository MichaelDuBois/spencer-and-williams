'use client'

import { useSetAtom } from 'jotai'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Configure, Index } from 'react-instantsearch'

import { ArticlesCarousel } from '@/app/travel/_components/ArticlesCarousel'
import { travelConfig } from '@/app/travel/config'
import { isFromHomePageAtom } from '@/stores/travel'

export const FeaturedArticles = () => {
  const { slug, algolia } = travelConfig
  const setIsFromHomePage = useSetAtom(isFromHomePageAtom)

  return (
    <section className="mb-16">
      <Index indexName={algolia.primaryIndex.name} indexId="homepage_articles">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold">
              Featured Articles
            </h2>
            <p className="text-muted-foreground mt-1">
              Stories and guides from around the world
            </p>
          </div>
          <Link
            href={`/${slug}/search`}
            className="text-accent group flex items-center gap-1.5 text-sm font-medium"
            onClick={() => setIsFromHomePage(true)}>
            <span className="transition-transform group-hover:-translate-x-0.5">
              View all
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <Configure
          hitsPerPage={8}
          query=""
          ruleContexts={travelConfig.homepageCarousels?.[0]?.ruleContexts}
        />
        <ArticlesCarousel />
      </Index>
    </section>
  )
}
