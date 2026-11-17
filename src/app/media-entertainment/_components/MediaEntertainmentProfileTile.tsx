'use client'

import { BarChart3 } from 'lucide-react'
import Link from 'next/link'

import { MediaEntertainmentProfileAvatar } from '@/app/media-entertainment/_components/MediaEntertainmentProfileAvatar'
import type { MediaProfileTileVariant } from '@/app/media-entertainment/_components/MediaEntertainmentProfileVariants'
import { cn } from '@/lib/utils'

interface MediaEntertainmentProfileTileProps {
  label: string
  description: string
  variant: MediaProfileTileVariant
  isActive?: boolean
  /** Set on the tiles that are not the active one, once a choice exists. */
  isMuted?: boolean
  onSelect: () => void
  /** Affinities route for this profile, where it has a token to inspect. */
  affinitiesHref?: string
  onAffinitiesClick?: () => void
}

export const MediaEntertainmentProfileTile = ({
  label,
  description,
  variant,
  isActive = false,
  isMuted = false,
  onSelect,
  affinitiesHref,
  onAffinitiesClick,
}: MediaEntertainmentProfileTileProps) => (
  <div
    className={cn(
      'group/tile flex w-32 flex-col items-center transition-opacity duration-300 md:w-40',
      // Dimmed only against an active tile, so first entry — where nothing is
      // chosen yet — shows every profile at equal weight.
      isMuted && 'opacity-55 focus-within:opacity-100 hover:opacity-100',
    )}>
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive}
      className="focus-visible:outline-ring w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4">
      <MediaEntertainmentProfileAvatar
        variant={variant}
        className={cn(
          'aspect-square w-full rounded-full transition-all duration-300 ease-out',
          // Hover and keyboard focus both zoom, matching the poster cards.
          'group-focus-within/tile:scale-[1.08] group-hover/tile:scale-[1.08]',
          isActive && 'scale-[1.04] border-2 border-white ring-4 ring-white/15',
        )}
      />

      <span
        className={cn(
          'mt-3 block text-sm font-semibold md:text-base',
          isActive ? 'text-white' : 'text-white/85',
        )}>
        {label}
      </span>
      <span className="text-muted-foreground mt-1 block text-xs">
        {description}
      </span>
    </button>

    {affinitiesHref && (
      <Link
        href={affinitiesHref}
        onClick={onAffinitiesClick}
        className="text-muted-foreground hover:text-accent focus-visible:outline-ring mt-2 inline-flex items-center gap-1 rounded-md p-1 text-xs opacity-0 transition-all group-hover/tile:opacity-100 focus-visible:opacity-100 focus-visible:outline-2">
        <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />
        Affinities
      </Link>
    )}
  </div>
)
