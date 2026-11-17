'use client'

import { MapPin } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LocationMarkerProps {
  isHovered: boolean
  isSelected: boolean
}

export const LocationMarker = ({
  isHovered,
  isSelected,
}: LocationMarkerProps) => (
  <MapPin
    className={cn(
      'text-accent h-7 w-7 drop-shadow-md transition-transform [&_circle]:fill-white [&_circle]:stroke-white',
      (isHovered || isSelected) && 'scale-125',
    )}
    fill="currentColor"
  />
)
