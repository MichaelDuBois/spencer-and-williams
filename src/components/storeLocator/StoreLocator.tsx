'use client'

import { useEffect, useMemo, useState } from 'react'
import { Index, useHits } from 'react-instantsearch'

import { AvailabilityModeBanner } from '@/components/storeLocator/AvailabilityModeBanner'
import { FindNearMeButton } from '@/components/storeLocator/FindNearMeButton'
import { GeoSearchConfigure } from '@/components/storeLocator/GeoSearchConfigure'
import {
  getLocatorNoun,
  type LocatorNoun,
} from '@/components/storeLocator/getLocatorNoun'
import { MapboxMap } from '@/components/storeLocator/MapboxMap'
import { StoreCard } from '@/components/storeLocator/StoreCard'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useGeoSearch } from '@/hooks/useGeoSearch'
import type { UseGetRawHitOptions } from '@/hooks/useGetRawHit'
import {
  useProductStoreAvailability,
  type UseProductStoreAvailabilityReturn,
} from '@/hooks/useProductStoreAvailability'
import { useStoreIdFilter } from '@/hooks/useStoreIdFilter'
import { useUserLocation } from '@/hooks/useUserLocation'
import { NYC_FALLBACK } from '@/stores/geoSearch'
import type { GenericLocation } from '@/types/location.types'

interface StatusStripProps {
  status: 'loading' | 'granted' | 'denied'
  nounPlural: string
}

const StatusStrip = ({ status, nounPlural }: StatusStripProps) => {
  if (status === 'loading') {
    return (
      <div className="text-muted-foreground px-4 py-3 text-sm">
        Locating you…
      </div>
    )
  }
  if (status === 'granted') {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="text-foreground text-sm">
          Showing {nounPlural} near you
        </span>
        <FindNearMeButton />
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      <span className="text-muted-foreground text-sm">
        Location access denied.
      </span>
      <FindNearMeButton />
    </div>
  )
}

interface StoreLocatorInnerProps {
  availability: UseProductStoreAvailabilityReturn
  focusStore: GenericLocation | null
  slug: string
  noun: LocatorNoun
}

const StoreLocatorInner = ({
  availability,
  focusStore,
  slug,
  noun,
}: StoreLocatorInnerProps) => {
  const { singular, plural } = noun
  const isFocusMode = focusStore !== null
  const { status, coords } = useUserLocation({ autoRequest: !isFocusMode })
  const { center, setRadiusSearch, setBoundingBoxSearch } = useGeoSearch()
  const { items } = useHits<GenericLocation>()

  const { isAvailable, allowedStoreIds, stockByStoreId, productName } =
    availability

  const [selectedId, setSelectedId] = useState<string | null>(
    focusStore?.objectID ?? null,
  )
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    if (focusStore) {
      setRadiusSearch(focusStore._geoloc)
      return
    }
    if (status === 'granted' && coords) {
      setRadiusSearch(coords)
    }
    if (status === 'denied' && center === null) {
      setRadiusSearch(NYC_FALLBACK)
    }
  }, [focusStore, status, coords, center, setRadiusSearch])

  const extraFilters = useMemo(() => {
    if (!isAvailable) return undefined
    return allowedStoreIds.map((id) => `objectID:"${id}"`).join(' OR ')
  }, [isAvailable, allowedStoreIds])

  return (
    <>
      <GeoSearchConfigure
        extraFilters={
          extraFilters ?? (slug === 'b2b-warehouse' ? '' : undefined)
        }
      />
      <div className="flex flex-col md:grid md:h-[calc(100vh-var(--header-height,4rem))] md:grid-cols-[30%_70%]">
        <aside className="border-border md:order-1 md:flex md:flex-col md:overflow-hidden md:border-r">
          {isAvailable ? (
            <AvailabilityModeBanner
              productName={productName}
              backHref={`/${slug}/stores`}
              nounPlural={plural}
            />
          ) : (
            <StatusStrip status={status} nounPlural={plural} />
          )}
          <div className="md:flex-1 md:overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-muted-foreground p-4 text-sm">
                {isAvailable
                  ? `No ${plural} currently carry this product.`
                  : `No ${plural} in this area. Try zooming out.`}
              </div>
            ) : (
              items.map((loc) => (
                <StoreCard
                  key={loc.objectID}
                  location={loc}
                  isSelected={selectedId === loc.objectID}
                  verticalSlug={slug}
                  noun={singular}
                  inStock={
                    isAvailable ? stockByStoreId[loc.objectID] : undefined
                  }
                  showShopCTA={
                    !isAvailable || stockByStoreId[loc.objectID] === true
                  }
                  productId={availability.productId ?? undefined}
                  onHover={setHoveredId}
                  onSelect={setSelectedId}
                />
              ))
            )}
          </div>
        </aside>
        <div className="sticky top-[var(--header-height,4rem)] z-10 -order-1 h-[60vh] md:static md:order-2 md:h-full">
          <MapboxMap
            locations={items}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={setSelectedId}
            userCoords={coords}
            initialCenter={focusStore?._geoloc ?? NYC_FALLBACK}
            onViewportChange={setBoundingBoxSearch}
            verticalSlug={slug}
          />
        </div>
      </div>
    </>
  )
}

interface AvailabilityPlaceholderProps {
  availability: UseProductStoreAvailabilityReturn
  slug: string
  nounPlural: string
}

const AvailabilityPlaceholder = ({
  availability,
  slug,
  nounPlural,
}: AvailabilityPlaceholderProps) => (
  <div className="flex flex-col md:grid md:h-[calc(100vh-var(--header-height,4rem))] md:grid-cols-[30%_70%]">
    <aside className="border-border md:flex md:flex-col md:overflow-hidden md:border-r">
      <AvailabilityModeBanner
        productName={availability.productName}
        backHref={`/${slug}/stores`}
        nounPlural={nounPlural}
      />
      <div className="text-muted-foreground p-4 text-sm">
        {availability.isLoading
          ? 'Loading availability…'
          : `No ${nounPlural} currently carry this product.`}
      </div>
    </aside>
    <div className="bg-muted hidden md:block" />
  </div>
)

interface StoreLocatorProps {
  productQueryOptions?: UseGetRawHitOptions
}

export const StoreLocator = ({
  productQueryOptions,
}: StoreLocatorProps = {}) => {
  const config = useActiveConfig()
  const indexName = config?.algolia.indices.locations?.name
  const availability = useProductStoreAvailability(productQueryOptions)
  const { store: focusStore } = useStoreIdFilter()
  const noun = getLocatorNoun(config)

  if (!indexName || !config) return null

  // When there are no stores with the product, hold the search until the product's allowed stores resolve — otherwise an unfiltered geo query would render every nearby store.
  if (availability.isAvailable && availability.allowedStoreIds.length === 0) {
    return (
      <AvailabilityPlaceholder
        availability={availability}
        slug={config.slug}
        nounPlural={noun.plural}
      />
    )
  }

  return (
    <Index indexName={indexName}>
      <StoreLocatorInner
        availability={availability}
        focusStore={availability.isAvailable ? null : focusStore}
        slug={config.slug}
        noun={noun}
      />
    </Index>
  )
}
