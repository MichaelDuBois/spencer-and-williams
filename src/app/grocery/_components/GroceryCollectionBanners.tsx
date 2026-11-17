'use client'

import { motion } from 'motion/react'
import Link from 'next/link'

import { Image } from '@/components/image/Image'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useCollectionImages } from '@/hooks/useCollectionImages'
import { scrollFadeIn, transitionSlow } from '@/lib/animations'
import { getSlug } from '@/utilities/getSlug'

export const GroceryCollectionBanners = () => {
  const config = useActiveConfig()
  const { collections, imageMap } = useCollectionImages()

  if (!config || collections.length === 0) return null

  const { slug } = config

  return (
    <section className="container mx-auto px-6 py-12">
      <motion.h2
        {...scrollFadeIn()}
        transition={transitionSlow}
        className="text-foreground mb-8 text-2xl font-bold">
        Collections
      </motion.h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {collections.map(({ collection, label, description }, index) => {
          const collectionSlug = getSlug(collection)
          const imageUrl = imageMap.get(collection)

          return (
            <motion.div
              key={collectionSlug}
              {...scrollFadeIn(24)}
              transition={{ ...transitionSlow, delay: index * 0.15 }}>
              <Link
                href={`/${slug}/collection/${collectionSlug}`}
                className="bg-secondary rounded-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-video">
                  <Image
                    src={imageUrl}
                    alt={label}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-8 mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
                    fallback={
                      <div className="bg-accent/5 flex h-full w-full items-center justify-center">
                        <span className="text-muted-foreground text-lg font-medium">
                          {label}
                        </span>
                      </div>
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-foreground mb-2 text-xl font-bold">
                      {label}
                    </h3>
                    {description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                  <span className="text-accent mt-4 text-sm font-medium transition-colors group-hover:underline">
                    Shop {label} &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
