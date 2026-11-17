'use client'

import { MapPin } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TravelArticleMarkerProps {
  isHovered: boolean
  isSelected: boolean
}

export const TravelArticleMarker = ({
  isHovered,
  isSelected,
}: TravelArticleMarkerProps) => (
  <MapPin
    className={cn(
      'text-accent h-8 w-8 cursor-pointer drop-shadow-md transition-transform [&_circle]:fill-white [&_circle]:stroke-white',
      (isHovered || isSelected) && 'scale-125',
    )}
    fill="currentColor"
  />
)
