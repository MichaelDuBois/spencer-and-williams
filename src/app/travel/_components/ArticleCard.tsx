'use client'

import { useSetAtom } from 'jotai'
import { Clock } from 'lucide-react'
import Link from 'next/link'

import { getArticleHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import { Image } from '@/components/image/Image'
import {
  trackContentClick,
  type ContentClickHit,
} from '@/lib/analytics/content-events'
import { isFromHomePageAtom } from '@/stores/travel'

interface ArticleCardHit extends ContentClickHit, Record<string, unknown> {}

interface ArticleCardProps {
  hit: ArticleCardHit
}

export const ArticleCard = ({ hit }: ArticleCardProps) => {
  const { slug, algolia } = travelConfig
  const setIsFromHomePage = useSetAtom(isFromHomePageAtom)
  const articleHitTemplate = algolia.primaryIndex.template

  if (!articleHitTemplate) return null

  const values = getArticleHitValues(hit, articleHitTemplate, slug)

  return (
    <Link
      href={values.productUrl}
      className="group block"
      onClick={() => {
        setIsFromHomePage(true)
        trackContentClick(hit, {
          contentType: 'article',
          index: algolia.primaryIndex.name,
        })
      }}>
      <div className="rounded-card bg-muted relative aspect-[4/3] overflow-hidden">
        <Image
          src={values.image}
          alt={values.title}
          fill
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-5 text-white">
          {values.category && (
            <span className="mb-2 inline-block text-xs font-semibold tracking-wider uppercase opacity-80">
              {values.category}
            </span>
          )}
          <h3 className="line-clamp-2 text-lg leading-snug font-bold">
            {values.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
            {values.author && <span>By {values.author}</span>}
            {values.readTime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {values.readTime}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
