'use client'

import { Clock } from 'lucide-react'
import { Highlight } from 'react-instantsearch'

import type { PodcastHitValues } from '@/app/travel/hitValues.types'
import type { TravelPodcastHitTemplate } from '@/app/travel/types'

import type { Hit as AlgoliaHit, BaseHit } from 'instantsearch.js'

export type TravelPodcastContentProps =
  | {
      values: PodcastHitValues
      highlight: true
      hit: AlgoliaHit<BaseHit>
      template: TravelPodcastHitTemplate
    }
  | {
      values: PodcastHitValues
      highlight?: false
    }

export const TravelPodcastContent = (props: TravelPodcastContentProps) => {
  const { values } = props

  return (
    <>
      <span className="text-accent text-xs font-medium tracking-wider uppercase">
        {values.episodeNumber && `Episode ${values.episodeNumber}`}
        {values.episodeNumber && values.title && ' - '}
        {props.highlight ? (
          <Highlight
            attribute={props.template.attributes.title}
            hit={props.hit}
          />
        ) : (
          values.title
        )}
      </span>
      <h3 className="text-foreground group-hover:text-accent mt-1.5 line-clamp-1 font-semibold transition-colors">
        {values.episode || values.title}
      </h3>
      {values.summary && (
        <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
          {values.summary}
        </p>
      )}
      <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
        <span>
          Hosted by{' '}
          <span className="text-foreground font-medium">
            {values.hosts?.join(', ')}
          </span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{values.duration}</span>
        </span>
      </div>
    </>
  )
}
