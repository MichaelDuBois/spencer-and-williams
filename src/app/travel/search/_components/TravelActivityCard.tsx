'use client'

import { getActivityHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { formatLocation } from '@/app/travel/_utils/travelContentFormatters'
import { travelConfig } from '@/app/travel/config'
import type { TravelActivityHitTemplate } from '@/app/travel/types'
import { Image } from '@/components/image/Image'
import type { MultifeedHit } from '@/lib/multifeed-composition'

interface TravelActivityCardProps {
  hit: MultifeedHit
  template: TravelActivityHitTemplate
}

export const TravelActivityCard = ({
  hit,
  template,
}: TravelActivityCardProps) => {
  const values = getActivityHitValues(hit, template, travelConfig.slug)
  const location = formatLocation(values.location, values.country)

  return (
    <div className="group block">
      <div className="rounded-card bg-muted relative aspect-[4/3] overflow-hidden">
        <Image
          src={values.image}
          alt={values.title}
          fill
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-5 text-white">
          {location && (
            <span className="mb-2 inline-block text-xs font-semibold tracking-wider uppercase opacity-80">
              {location}
            </span>
          )}
          <h3 className="line-clamp-2 text-lg leading-snug font-bold">
            {values.title}
          </h3>
        </div>
      </div>
    </div>
  )
}
