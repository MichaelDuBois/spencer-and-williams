/**
 * Loading placeholder for the billboard hero.
 *
 * Same box as the real hero — including the `-mt-[var(--header-height)]` that
 * cancels `<main>`'s padding — so the page does not reflow when the artwork
 * lands.
 *
 * Deliberately **static**. `animate-pulse` on a 90svh block is a full-screen
 * strobe on every load, which reads as broken rather than as loading. A still
 * gradient that resolves into the hero's own bottom scrim is quieter and hides
 * the seam with the first rail, which floats over this band.
 */
export const MediaEntertainmentBillboardSkeleton = () => (
  <div
    aria-hidden="true"
    className="from-muted to-background -mt-[var(--header-height)] h-[68svh] min-h-[480px] bg-linear-to-b md:h-[90svh] md:min-h-[560px]"
  />
)
