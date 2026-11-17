'use client'

import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCategoryImages } from '@/hooks/useCategoryImages'
import type { HitQueryOptions } from '@/types/hitQueryOptions.types'
import { getSlug } from '@/utilities/getSlug'

interface CategoryGridProps {
  label?: string
  queryOptions?: HitQueryOptions
}

export const CategoryGrid = ({ label, queryOptions }: CategoryGridProps) => {
  const config = useActiveConfig()
  const { carouselCategories, imageMap } = useCategoryImages(queryOptions)

  if (!config || carouselCategories.length === 0) return null

  const { slug } = config

  return (
    <section className="mb-16">
      <h2 className="text-foreground mb-8 text-2xl font-bold">
        {label ?? `Shop by Category`}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {carouselCategories.map(({ category, label }) => {
          const categorySlug = getSlug(category)
          const imageUrl = imageMap.get(category)

          return (
            <Link
              key={categorySlug}
              href={`/${slug}/category/${categorySlug}`}
              className="group rounded-card relative flex aspect-square items-center justify-center overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-card absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
                <Image
                  src={imageUrl}
                  alt={label}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="h-full w-full object-contain p-6"
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-black/10 group-hover:from-black/50" />
              <span className="relative text-lg font-semibold text-white">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
