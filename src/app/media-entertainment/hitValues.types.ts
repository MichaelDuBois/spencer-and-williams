export interface MediaEntertainmentCastMember {
  name: string
  character?: string
  /** Absolute portrait URL, derived from TMDB's `profile_path`. */
  profileImage?: string
}

export interface MediaEntertainmentSeason {
  seasonNumber: number
  name: string
  episodeCount?: number
  /** Absolute poster URL, derived from TMDB's `poster_path`. */
  poster?: string
}

export interface MediaEntertainmentTitleHitValues {
  objectID: string
  productUrl: string
  title: string
  tagline?: string
  overview?: string
  type?: 'movie' | 'show'
  genres?: string[]
  keywords?: string[]
  releaseYear?: string
  runtime?: number
  maturityRating?: string
  seasonCount?: number
  episodeCount?: number
  poster?: string
  backdrop?: string
  seasons?: MediaEntertainmentSeason[]
  cast?: MediaEntertainmentCastMember[]
  directors?: { name: string }[]
  rating?: number
  ratingCount?: number
  popularity?: number
}

export interface MediaTitleHit extends MediaEntertainmentTitleHitValues {
  __queryID?: string
  __position?: number
}

export interface MediaRailItem extends MediaTitleHit {
  rank: number // 1-based, computed in the hook — drives the Top 10 numerals
}
