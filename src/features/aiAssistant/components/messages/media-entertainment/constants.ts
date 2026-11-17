/**
 * How many posters a group shows.
 *
 * Higher than the shared `MAX_VISIBLE_ITEMS` of 4, which is sized for the wide
 * product cards every other vertical renders. A poster is 112px in a scrollable
 * track, so four of them barely fill the panel and leave the shelf unable to
 * scroll — the one affordance this layout exists for. Eight reads as a shelf.
 *
 * Shared by the streaming and settled renderers on purpose: if they disagreed,
 * the shelf would visibly resize the moment the tool call finished.
 */
export const MAX_VISIBLE_TITLES = 8

/**
 * The panel is narrow, so an assistant poster runs at a fixed width rather than
 * the rails' breakpoint ladder. Shared with the skeleton so the shelf doesn't
 * shift the moment a title resolves.
 */
export const CARD_WIDTH_CLASS = 'w-28'
