import { useCallback, useLayoutEffect, useRef } from 'react'

import { LANDING_CARD_ATTRIBUTES } from '@/components/landing/landing-card-attributes'

// Equalize natural collapsed heights without making expanded cards stretch their
// neighbours; fixed heights add whitespace and grid stretching couples expansion.
export const useLandingCardHeights = () => {
  const gridRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>(`[${LANDING_CARD_ATTRIBUTES.card}]`),
    )
    const updateHeights = () => {
      // Measure intrinsic collapsed heights before applying row alignment.
      for (const card of cards) card.style.minHeight = ''
      const rows: { card: HTMLElement; height: number }[][] = []
      let previousLeft = Infinity

      for (const card of cards) {
        const left = card.offsetLeft
        if (left <= previousLeft) rows.push([])
        const content = card.querySelector<HTMLElement>(
          `[${LANDING_CARD_ATTRIBUTES.content}]`,
        )
        rows[rows.length - 1].push({
          card,
          height: card.offsetHeight - (content?.offsetHeight ?? 0),
        })
        previousLeft = left
      }

      for (const row of rows) {
        const height = Math.max(...row.map((item) => item.height))
        for (const { card } of row) card.style.minHeight = `${height}px`
      }
    }

    updateHeights()
    let gridWidth = grid.getBoundingClientRect().width
    const observer = new ResizeObserver((entries) => {
      const gridEntry = entries.find((entry) => entry.target === grid)
      const hasWidthChanged =
        gridEntry !== undefined && gridEntry.contentRect.width !== gridWidth
      if (gridEntry) gridWidth = gridEntry.contentRect.width
      if (hasWidthChanged || entries.some((entry) => entry.target !== grid))
        updateHeights()
    })
    // Width observation also handles breakpoint changes that keep body sizes equal.
    // Ignore grid height changes caused by opening an accordion.
    observer.observe(grid)
    for (const element of grid.querySelectorAll(
      `[${LANDING_CARD_ATTRIBUTES.body}], [${LANDING_CARD_ATTRIBUTES.toggle}]`,
    )) {
      observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  return useCallback((element: HTMLElement | null) => {
    gridRef.current = element
  }, [])
}
