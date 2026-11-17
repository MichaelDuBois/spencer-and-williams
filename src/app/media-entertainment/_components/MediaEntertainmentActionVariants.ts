/**
 * The call-to-action row, shared by the billboard hero and the detail sheet — the
 * two places a title offers Play and Add to My List, which have to look identical.
 */
export const ACTION_BASE_CLASS =
  'rounded-button focus-visible:outline-ring inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed md:text-base'

export const ACTION_PRIMARY_CLASS = 'bg-accent hover:bg-accent/85 text-white'

/** Extra width for the one action that carries a surface — Play on the sheet. */
export const ACTION_WIDE_CLASS = 'px-9 md:px-12'

/** Not `bg-secondary`: the theme's 28%-lightness grey reads as a dead rectangle
 *  over artwork. */
export const ACTION_GLASS_CLASS =
  'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
