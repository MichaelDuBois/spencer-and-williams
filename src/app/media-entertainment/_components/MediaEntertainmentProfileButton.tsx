'use client'

import { MediaEntertainmentProfileAvatar } from '@/app/media-entertainment/_components/MediaEntertainmentProfileAvatar'
import {
  ANONYMOUS_TILE_VARIANT,
  getPersonaTileVariant,
  REALTIME_TILE_VARIANT,
} from '@/app/media-entertainment/_components/MediaEntertainmentProfileVariants'
import { useMediaProfile } from '@/app/media-entertainment/_hooks/useMediaProfile'

/**
 * The active profile's avatar in the header. Clicking it reopens the picker, which
 * doubles as the switcher — one surface for choosing a profile rather than a tile
 * grid on entry and an unrelated dropdown afterwards.
 */
export const MediaEntertainmentProfileButton = () => {
  const { persona, realtimeEnabled, openPicker } = useMediaProfile()

  const variant = persona
    ? getPersonaTileVariant(persona.id)
    : realtimeEnabled
      ? REALTIME_TILE_VARIANT
      : ANONYMOUS_TILE_VARIANT
  const label =
    persona?.label ?? (realtimeEnabled ? 'Realtime profile' : 'Anonymous')

  return (
    <button
      type="button"
      onClick={openPicker}
      aria-label={`Switch profile — watching as ${label}`}
      title={`Watching as ${label}`}
      className="focus-visible:outline-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2">
      <MediaEntertainmentProfileAvatar
        variant={variant}
        className="h-7 w-7 rounded-full"
      />
    </button>
  )
}
