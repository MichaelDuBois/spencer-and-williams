/**
 * Chip geometry shared by the filter chips and the sort chip.
 * The search page deliberately has no sidebar, so every control on it is a chip
 * in one horizontal row and they all have to line up.
 */
export const CHIP_CLASS =
  'rounded-button border-border bg-card text-foreground hover:border-foreground/40 hover:bg-secondary focus-visible:outline-ring inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'

/** A chip that currently carries a refinement. */
export const CHIP_ACTIVE_CLASS =
  'border-accent bg-accent text-accent-foreground hover:bg-accent/90 hover:border-accent'

/** The trailing count badge. `opacity` rather than a colour token so it reads on
 *  both the resting and the accent-filled chip. */
export const CHIP_COUNT_CLASS = 'text-xs tabular-nums opacity-70'

/** The popover panel: frosted glass over the posters rather than an opaque card.
 *  Width is fixed below `md` and shrink-to-fit above, so the panel is as wide as
 *  the columns the list grows. */
export const CHIP_PANEL_CLASS =
  'bg-popover/80 supports-[backdrop-filter]:bg-popover/60 ring-foreground/15 w-52 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl md:w-auto md:max-w-[calc(100vw-2rem)]'

/** One facet value inside a chip's popover. */
export const CHIP_OPTION_CLASS =
  'rounded-input text-foreground/80 hover:bg-foreground/10 hover:text-foreground has-[:focus-visible]:bg-foreground/10 has-[:focus-visible]:outline-ring flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-left text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2'

/** A facet value that is currently refined — the accent colour is the only cue,
 *  so it has to survive hover too. */
export const CHIP_OPTION_ACTIVE_CLASS = 'text-accent hover:text-accent'

/** Facet values. A seven-row column-flow grid from `md` up: values fill a column,
 *  then start the next, and the shrink-to-fit panel widens to match. Seven rows
 *  puts the 18–19 genres of a single record type in three columns and the full
 *  27 in four; `MAX_FACET_VALUES` caps it there so the panel can't outgrow `md`. */
export const CHIP_PANEL_LIST_CLASS =
  'max-h-80 overflow-y-auto md:grid md:max-h-none md:auto-cols-[10rem] md:grid-flow-col md:grid-rows-[repeat(7,auto)] md:gap-x-1 md:overflow-y-visible'

/**
 * Poster grid. The column counts are tuned so a cell lands close to the widths
 * `RAIL_VARIANTS.poster.sizes` declares — the poster card owns its own `sizes`,
 * so the grid has to meet it rather than the other way round.
 */
export const POSTER_GRID_CLASS =
  'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8'
