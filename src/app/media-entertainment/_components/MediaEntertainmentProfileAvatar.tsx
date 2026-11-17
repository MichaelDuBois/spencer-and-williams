import Image from 'next/image'

import type { MediaProfileTileVariant } from '@/app/media-entertainment/_components/MediaEntertainmentProfileVariants'
import { cn } from '@/lib/utils'

interface MediaEntertainmentProfileAvatarProps {
  variant: MediaProfileTileVariant
  /** Geometry — size, rounding, border — which differs per surface. */
  className?: string
}

export const MediaEntertainmentProfileAvatar = ({
  variant,
  className,
}: MediaEntertainmentProfileAvatarProps) => (
  <span
    className={cn(
      'flex items-center justify-center overflow-hidden',
      variant.face,
      className,
    )}>
    {variant.imageSrc ? (
      <Image
        src={variant.imageSrc}
        alt=""
        width={160}
        height={160}
        className="h-full w-full object-cover"
      />
    ) : (
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
        className="h-[70%] w-[70%]">
        {/* Off-level eyes: a perfectly symmetric face reads as a corporate icon,
          and the pattern this copies draws them uneven. */}
        <circle cx="35" cy="41" r="8" fill="currentColor" />
        <circle cx="66" cy="35" r="8" fill="currentColor" />
        <path
          d="M30 60 Q49 78 71 63"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    )}
  </span>
)
