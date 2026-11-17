'use client'

import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCollectionImages } from '@/hooks/useCollectionImages'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'
import { getSlug } from '@/utilities/getSlug'

interface CollectionBannersProps {
  queryOptions?: HitQueryOptions
}

export const CollectionBanners = ({
  queryOptions,
}: CollectionBannersProps = {}) => {
  const config = useActiveConfig()
  const { collections, imageMap } = useCollectionImages(queryOptions)

  if (!config || collections.length === 0) return null

  const { slug } = config

  return (
    <section className="border-border space-y-px border-y">
      {collections.map(({ collection, label, description }, index) => {
        const collectionSlug = getSlug(collection)
        const imageUrl = imageMap.get(collection)
        const isReversed = index % 2 !== 0

        return (
          <Link
            key={collectionSlug}
            href={`/${slug}/collection/${collectionSlug}`}
            className="bg-card hover:bg-accent/5 group grid grid-cols-1 transition-colors md:grid-cols-2">
            <div
              className={`bg-primary/5 relative aspect-square md:aspect-auto md:min-h-96 ${isReversed ? 'md:order-2' : ''}`}>
              <Image
                src={imageUrl}
                alt={label}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-10 mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
            <div
              className={`flex flex-col justify-center px-8 py-12 md:px-16 ${isReversed ? 'md:order-1' : ''}`}>
              <h3 className="text-foreground mb-3 text-2xl font-bold">
                {label}
              </h3>
              {description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {description}
                </p>
              )}
              <span className="bg-accent text-accent-foreground rounded-button inline-block w-fit px-6 py-2.5 text-sm font-medium transition-opacity group-hover:opacity-90">
                Shop {label}
              </span>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
