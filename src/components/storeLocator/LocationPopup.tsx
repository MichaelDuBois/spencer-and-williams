'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { getLocationName } from '@/types/location.types'
import type { GenericLocation } from '@/types/location.types'
import { formatAddress } from '@/utilities/formatAddress'
import { formatHours } from '@/utilities/formatHours'

interface LocationPopupProps {
  location: GenericLocation
  verticalSlug: string
}

export const LocationPopup = ({
  location,
  verticalSlug,
}: LocationPopupProps) => {
  const name = getLocationName(location, verticalSlug)
  const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${location._geoloc.lat},${location._geoloc.lng}`
  const shopHref = `/${verticalSlug}/search?storeId=${encodeURIComponent(location.objectID)}`

  return (
    <div className="flex min-w-48 flex-col gap-1 py-1 text-sm">
      <Link
        href={shopHref}
        className="text-foreground cursor-pointer font-medium hover:underline">
        {name}
      </Link>
      <div className="text-muted-foreground text-xs">
        {formatAddress(location.address).map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <div className="text-muted-foreground mt-1 text-xs">
        {formatHours(location.openingTime, location.closingTime)}
      </div>
      <a
        href={googleMapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent mt-1 inline-flex items-center gap-1 text-xs font-medium hover:underline">
        Get directions
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}
