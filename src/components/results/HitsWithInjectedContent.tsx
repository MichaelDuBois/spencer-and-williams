'use client'

import { createContext, useCallback, useContext } from 'react'
import { Hits, useHits } from 'react-instantsearch'

import { NoResultsRecovery } from '@/components/results/NoResultsRecovery'
import { useActiveConfig } from '@/hooks/useActiveConfig'

import type { BaseHit, Hit as AlgoliaHit } from 'instantsearch.js'

interface HitsWithInjectedContentProps {
  hitComponent: (props: { hit: AlgoliaHit<BaseHit> }) => React.ReactNode
  classNames: { list: string; item: string }
  transformItems?: (hits: AlgoliaHit<BaseHit>[]) => AlgoliaHit<BaseHit>[]
  injection?: {
    content: React.ReactNode
    afterIndex: number
    /**
     * `row` (default) spans the grid width, breaking the rows like a banner.
     * Past the last hit it settles at the end, so it still shows on result sets
     * smaller than `afterIndex`.
     *
     * `cell` takes a single grid cell and flows with the columns. Past the last
     * hit it is dropped instead, since one content-sized tile trailing the grid
     * reads as a broken cell.
     */
    span?: 'row' | 'cell'
    /**
     * Give up the last hit so the cell count matches an uninjected page,
     * keeping the grid's row rhythm stable as the user pages. Only meaningful
     * alongside `cell` — a row never competes with the hits for a cell.
     */
    replacesHit?: boolean
  }
}

const HitRendererContext = createContext<
  HitsWithInjectedContentProps['hitComponent'] | null
>(null)

const HitRenderer = ({ hit }: { hit: AlgoliaHit<BaseHit> }) => {
  const renderHit = useContext(HitRendererContext)
  if (!renderHit) return null
  return renderHit({ hit })
}

export const HitsWithInjectedContent = ({
  hitComponent,
  classNames,
  injection,
  transformItems,
}: HitsWithInjectedContentProps) => {
  const config = useActiveConfig()
  const recovery = <NoResultsRecovery basePath={`/${config?.slug ?? ''}`} />

  if (!injection) {
    return (
      <HitRendererContext.Provider value={hitComponent}>
        <Hits
          hitComponent={HitRenderer}
          classNames={classNames}
          bannerComponent={false}
          transformItems={transformItems}
        />
        {recovery}
      </HitRendererContext.Provider>
    )
  }

  return (
    <HitRendererContext.Provider value={hitComponent}>
      <InjectedGrid
        hitComponent={HitRenderer}
        classNames={classNames}
        injection={injection}
        transformItems={transformItems}
      />
      {recovery}
    </HitRendererContext.Provider>
  )
}

const InjectedGrid = ({
  hitComponent: HitComponent,
  classNames,
  injection,
  transformItems: transformProductItems,
}: HitsWithInjectedContentProps & {
  injection: NonNullable<HitsWithInjectedContentProps['injection']>
}) => {
  const { afterIndex, content, span = 'row', replacesHit } = injection

  // Dropping the hit here rather than while rendering keeps `__position` intact
  // — InstantSearch assigns it before `transformItems` runs — and leaves the
  // widget's automatic view event reporting only the hits actually on screen.
  //
  // Give one up only while that still leaves a hit after the slot. Otherwise the
  // slot would land past the end and be dropped, costing a hit for no content.
  const transformItems = useCallback(
    (hits: AlgoliaHit<BaseHit>[]) => {
      const items = transformProductItems ? transformProductItems(hits) : hits
      return replacesHit && span === 'cell' && items.length - 1 > afterIndex
        ? items.slice(0, -1)
        : items
    },
    [replacesHit, span, afterIndex, transformProductItems],
  )

  const { items } = useHits<AlgoliaHit<BaseHit>>({ transformItems })

  if (items.length === 0) return null

  const isOutOfRange = afterIndex >= items.length
  // `items.length` places the slot after the final hit; -1 drops it entirely.
  const slotIndex = isOutOfRange
    ? span === 'row'
      ? items.length
      : -1
    : afterIndex

  const slot = (
    <li
      key="injected"
      className={span === 'row' ? 'col-span-full' : classNames.item}>
      {content}
    </li>
  )

  return (
    <ol className={`ais-Hits-list ${classNames.list}`}>
      {items.flatMap((hit, index) => [
        ...(index === slotIndex ? [slot] : []),
        <li key={hit.objectID} className={`ais-Hits-item ${classNames.item}`}>
          <HitComponent hit={hit} />
        </li>,
      ])}
      {slotIndex === items.length ? slot : null}
    </ol>
  )
}
