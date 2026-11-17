export interface MediaProfileTileVariant {
  imageSrc?: string
  /** Face ink, dimmed on the tiles that stand for no particular viewer. */
  face: string
}

export const PERSONA_TILE_VARIANTS: Record<string, MediaProfileTileVariant> = {
  'marvel-fan': {
    imageSrc: '/images/media-entertainment/avatars/superhero.webp',
    face: 'text-white',
  },
  'kids-family': {
    imageSrc: '/images/media-entertainment/avatars/dinosaur.webp',
    face: 'text-white',
  },
}

export const REALTIME_TILE_VARIANT: MediaProfileTileVariant = {
  imageSrc: '/images/media-entertainment/avatars/laptop.webp',
  face: 'text-white',
}

export const ANONYMOUS_TILE_VARIANT: MediaProfileTileVariant = {
  imageSrc: '/images/media-entertainment/avatars/hoodie.webp',
  face: 'text-white/75',
}

export const getPersonaTileVariant = (
  personaId: string,
): MediaProfileTileVariant =>
  PERSONA_TILE_VARIANTS[personaId] ?? ANONYMOUS_TILE_VARIANT
