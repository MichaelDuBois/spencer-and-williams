'use client'

import { useSetAtom } from 'jotai'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { getArticleHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import { TravelArticleContent } from '@/app/travel/search/_components/TravelArticleContent'
import { TravelHitImage } from '@/app/travel/search/_components/TravelHitImage'
import type { TravelArticleHitTemplate } from '@/app/travel/types'
import { trackContentClick } from '@/lib/analytics/content-events'
import { isFromHomePageAtom } from '@/stores/travel'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

interface TravelArticleHitProps {
  hit: AlgoliaHit<BaseHit>
  template: TravelArticleHitTemplate
}

const basePath = `/${travelConfig.slug}`

export const TravelArticleHit = ({ hit, template }: TravelArticleHitProps) => {
  const pathname = usePathname()
  const isHomePage = pathname === basePath || pathname === `${basePath}/`
  const setIsFromHomePage = useSetAtom(isFromHomePageAtom)
  const values = getArticleHitValues(hit, template, travelConfig.slug)

  return (
    <Link
      href={values.productUrl}
      className="group block h-full"
      onClick={() => {
        if (isHomePage) setIsFromHomePage(true)
        trackContentClick(hit, {
          contentType: 'article',
          index: travelConfig.algolia.primaryIndex.name,
        })
      }}>
      <article className="border-border flex flex-col gap-4 border-b py-6 first:pt-2 last:border-b-0 sm:flex-row sm:gap-6">
        <TravelHitImage
          variant="article"
          image={values.image}
          title={values.title}
          containerClassName="bg-muted relative h-48 sm:h-32 w-full sm:w-48 shrink-0 overflow-hidden rounded-lg"
        />

        <div className="flex flex-1 flex-col justify-center">
          <TravelArticleContent values={values} hit={hit} template={template} />
        </div>
      </article>
    </Link>
  )
}
