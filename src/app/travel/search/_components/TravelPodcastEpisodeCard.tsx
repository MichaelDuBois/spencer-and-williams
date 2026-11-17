'use client'

import { useSetAtom } from 'jotai'
import { Play } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { travelConfig } from '@/app/travel/config'
import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import { TravelPodcastContent } from '@/app/travel/search/_components/TravelPodcastContent'
import type { TravelPodcastHitTemplate } from '@/app/travel/types'
import { trackContentClick } from '@/lib/analytics/content-events'
import { isFromHomePageAtom } from '@/stores/travel'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

export type TravelPodcastEpisodeCardProps =
  | {
      episode: PodcastHitValues
      hit: AlgoliaHit<BaseHit>
      template: TravelPodcastHitTemplate
    }
  | {
      episode: PodcastHitValues
    }

const basePath = `/${travelConfig.slug}`

export const TravelPodcastEpisodeCard = (
  props: TravelPodcastEpisodeCardProps,
) => {
  const pathname = usePathname()
  const isHomePage = pathname === basePath || pathname === `${basePath}/`
  const setIsFromHomePage = useSetAtom(isFromHomePageAtom)
  const { episode } = props

  return (
    <Link
      href={episode.productUrl}
      className="group block h-full"
      onClick={() => {
        if (isHomePage) setIsFromHomePage(true)
        if ('hit' in props) {
          trackContentClick(props.hit, {
            contentType: 'podcast',
            index: travelConfig.algolia.indices.podcasts.name,
          })
        }
      }}>
      <article className="bg-muted/30 border-border hover:border-accent/30 hover:bg-muted/50 rounded-card flex h-full gap-4 border p-4 transition-all duration-200">
        <div className="min-w-0 flex-1">
          {'hit' in props ? (
            <TravelPodcastContent
              values={episode}
              highlight
              hit={props.hit}
              template={props.template}
            />
          ) : (
            <TravelPodcastContent values={episode} />
          )}
        </div>
        <div className="border-border group-hover:border-accent group-hover:bg-accent hidden h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border transition-all group-hover:text-white sm:flex">
          <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
        </div>
      </article>
    </Link>
  )
}
