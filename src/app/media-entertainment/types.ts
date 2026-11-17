import type {
  MediaEntertainmentTitleHitValues,
  MediaRailItem,
} from '@/app/media-entertainment/hitValues.types'
import type { MediaWatchSeedMap } from '@/stores/mediaWatchState'
import type { CreateConfigType } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

export type MediaEntertainmentHitTemplate =
  HitTemplate<MediaEntertainmentTitleHitValues>

export type MediaRailShape = 'poster' | 'backdrop' | 'spotlight' | 'top10'

/** Smallest shared shape for anything the homepage renders as a titled row. */
export interface MediaSectionConfig {
  id: string // stable key for React, query keys, tests
  title: string
}

/**
 * How a section selects its titles. A rule context is the driver — the rule's
 * consequence supplies the selection — and `filters` is the single escape hatch
 * for a section that has to work without a dashboard rule. Nothing is AND'd in
 * beneath it: whatever a spec sets is the whole query.
 */
export interface MediaSectionQuery extends MediaSectionConfig {
  ruleContexts?: string[] // pinning rules; dropped while a persona is active
  filterRuleContexts?: string[] // filtering rules; always sent
  filters?: string // sent verbatim; quote values with spaces or ampersands
}

/** How a row looks, independent of where its titles come from. */
export interface MediaRailPresentation extends MediaSectionConfig {
  shape?: MediaRailShape // defaults to 'poster'
  hitsPerPage?: number
}

/** One homepage row, selected by a search against the index. */
export interface MediaRailConfig
  extends MediaSectionQuery, MediaRailPresentation {}

/**
 * One nav-reachable results page at `/<slug>/search/<id>` — the search results
 * page over a narrowed set, so `id` doubles as the URL segment and `title` as
 * both the nav label and the page heading.
 */
export interface MediaHeaderSectionConfig extends MediaSectionQuery {
  /** Attributes the section already locks, so their chip drops out of the row. */
  hiddenFacets?: string[]
}

/** One entry in the header nav. */
export interface MediaNavItem {
  label: string
  /** Absent while the destination does not exist yet — the item renders inert. */
  href?: string
}

/**
 * One homepage row whose titles come from Recommend, seeded from Continue
 * Watching. It carries no query fields because the model is the selection, and
 * its `title` is a prefix: the seed's own title is appended at render time, so
 * the row reads "Because you watched Iron Man".
 */
export interface MediaRecommendRailConfig extends MediaRailPresentation {
  /** Discriminates it from the browse rails it shares `homepageRails` with. */
  source: 'recommend'
}

/** One entry in `homepageRails` — a browse row or the Recommend row. */
export type MediaHomepageRailConfig = MediaRailConfig | MediaRecommendRailConfig

/**
 * How the homepage reads its rows out of the index's Rules. A rule whose only
 * condition is a context under `contextPrefix` is a rail: the ones config
 * already pins get their title from it, the rest are appended as discovered
 * rows.
 */
export interface MediaHomepageRailDiscoveryConfig {
  contextPrefix: string
  maxDiscovered: number
}

/** A rail config paired with the hits the hook resolved for it. */
export interface MediaRail extends MediaRailConfig {
  items: MediaRailItem[]
}

/**
 * What the AI assistant needs that the shared `features.agentStudio` block does
 * not cover. The agent id itself stays on `features.agentStudio`, alongside every
 * other vertical's; this is the vertical's own retrieval policy.
 */
export interface MediaAssistantConfig {
  /**
   * `vote_count` floor applied to every assistant search. The catalogue is the
   * raw TMDB dump — most records have no votes at all — so without this the
   * assistant recommends titles nobody has heard of.
   */
  qualityFloor: number
  /**
   * Profiles whose searches carry the maturity guard. Declared here rather than
   * inferred from a persona's affinities, so adding a second restricted profile
   * is a config change and never a code change.
   */
  restrictedProfileIds: string[]
  /** Seeded starter prompts — a blank chat box gets no engagement in a demo. */
  prompts: string[]
}

/**
 * `homepageRails` is deliberately not called `homepageCarousels`: that key
 * already exists on `VerticalConfig` with a different shape
 * (`HomepageCarouselConfig`), rendered by the shared `HomepageCarousels` /
 * `HomepageCarousel` pair off `useEmptyQueryHits` — one request per carousel,
 * product cards, no shape variants. A media rail carries a `shape`
 * (poster / backdrop / spotlight / top10), and the whole homepage resolves in a
 * single batched `search([...])` call. Same word, different component and
 * different fetch strategy, so the two names stay apart.
 */
export interface MediaEntertainmentConfigType extends CreateConfigType<MediaEntertainmentHitTemplate> {
  homepageRails?: MediaHomepageRailConfig[]
  homepageRailDiscovery: MediaHomepageRailDiscoveryConfig
  headerSections: MediaHeaderSectionConfig[]
  navItems?: MediaNavItem[]
  assistant: MediaAssistantConfig
  /**
   * The row the My List page shows while the list is empty, so a viewer with
   * nothing saved gets titles to add rather than a dead end. A rail like any
   * other, so it resolves through the same hook and is personalized the same way.
   */
  myListSuggestionsRail?: MediaRailConfig
  /**
   * Starting My List and Continue Watching per profile. Media-only, so it sits
   * here rather than on the shared `features` block — but it is the same idea as
   * `features.orderHistory.seeds`, and follows its shape: config declares
   * objectIDs, the store expands them into timestamped entries.
   */
  watchStateSeeds?: MediaWatchSeedMap
}
