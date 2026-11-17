'use client'

import { useCallback, useEffect, useState } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'

export type BillboardPauseReason = 'hover' | 'focus'

export interface UseBillboardRotationResult {
  index: number
  mountedSlides: ReadonlySet<number>
  goTo: (next: number) => void
  pause: (reason: BillboardPauseReason) => void
  resume: (reason: BillboardPauseReason) => void
}

export const DEFAULT_ROTATION_INTERVAL_MS = 9000

/** Slides mounted ahead of the active one, so the next crossfade has artwork. */
const LOOKAHEAD = 1

const NO_PAUSE_REASONS: Record<BillboardPauseReason, boolean> = {
  hover: false,
  focus: false,
}

interface RotationState {
  index: number
  mountedSlides: ReadonlySet<number>
}

const withLookahead = (
  mountedSlides: ReadonlySet<number>,
  index: number,
  count: number,
): ReadonlySet<number> => {
  if (count < 1) return mountedSlides

  const next = new Set(mountedSlides)
  for (let offset = 0; offset <= LOOKAHEAD; offset += 1) {
    next.add((index + offset) % count)
  }

  // The set only ever grows, so an unchanged size means nothing was added.
  return next.size === mountedSlides.size ? mountedSlides : next
}

const advanceTo = (
  previous: RotationState,
  index: number,
  count: number,
): RotationState => {
  return {
    index,
    mountedSlides: withLookahead(previous.mountedSlides, index, count),
  }
}

export const useBillboardRotation = (
  count: number,
  intervalMs: number = DEFAULT_ROTATION_INTERVAL_MS,
): UseBillboardRotationResult => {
  // Index and mount window are one state: they change together, in the timer
  // callback and in `goTo`, so neither needs an effect to catch up with the
  // other.
  const [{ index, mountedSlides }, setRotation] = useState<RotationState>(
    () => {
      return { index: 0, mountedSlides: withLookahead(new Set(), 0, count) }
    },
  )
  const [pausedBy, setPausedBy] = useState(NO_PAUSE_REASONS)
  // Bumped by `goTo` so the interval restarts from zero and the next automatic
  // advance doesn't arrive early after a manual jump.
  const [restartToken, setRestartToken] = useState(0)
  const [isDocumentHidden, setIsDocumentHidden] = useState(false)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    const handleVisibilityChange = () =>
      setIsDocumentHidden(document.visibilityState === 'hidden')

    handleVisibilityChange()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Reduced motion kills automatic rotation only — `goTo` still works, so the
  // indicator dots stay functional.
  const isRotating =
    count > 1 &&
    intervalMs > 0 &&
    !pausedBy.hover &&
    !pausedBy.focus &&
    !isDocumentHidden &&
    !prefersReducedMotion

  useEffect(() => {
    if (!isRotating) return

    // Functional update, so `index` is not a dependency and the interval isn't
    // torn down on every tick.
    const timer = setInterval(
      () =>
        setRotation((previous) =>
          advanceTo(previous, previous.index + 1, count),
        ),
      intervalMs,
    )
    return () => clearInterval(timer)
  }, [isRotating, intervalMs, restartToken, count])

  const goTo = useCallback(
    (next: number) => {
      setRotation((previous) => advanceTo(previous, next, count))
      setRestartToken((token) => token + 1)
    },
    [count],
  )

  const pause = useCallback(
    (reason: BillboardPauseReason) =>
      setPausedBy((previous) =>
        previous[reason] ? previous : { ...previous, [reason]: true },
      ),
    [],
  )

  const resume = useCallback(
    (reason: BillboardPauseReason) =>
      setPausedBy((previous) =>
        previous[reason] ? { ...previous, [reason]: false } : previous,
      ),
    [],
  )

  return {
    // Modulo on read, never in state: self-heals when `count` shrinks on a
    // refetch, with no extra effect and no extra render.
    index: count > 0 ? index % count : 0,
    mountedSlides,
    goTo,
    pause,
    resume,
  }
}
