'use client'

import { motion } from 'motion/react'
import Link from 'next/link'

import { fashionConfig } from '@/app/fashion/config'
import { Image } from '@/components/image/Image'
import { useCollectionImages } from '@/hooks/useCollectionImages'
import { scrollFadeIn, transitionSlow } from '@/lib/animations'
import { getSlug } from '@/utilities/getSlug'

export const FeaturedCollections = () => {
  const { slug } = fashionConfig
  const { collections, imageMap } = useCollectionImages()

  if (collections.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-24">
      <motion.h2
        {...scrollFadeIn()}
        transition={transitionSlow}
        className="text-muted-foreground mb-12 text-center text-xs tracking-[0.3em] uppercase">
        Featured Collections
      </motion.h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {collections.map(({ collection, label }, index) => {
          const imageUrl = imageMap.get(collection)

          return (
            <motion.div
              key={collection}
              {...scrollFadeIn(24)}
              transition={{ ...transitionSlow, delay: index * 0.15 }}>
              <Link
                href={`/${slug}/collection/${getSlug(collection)}`}
                className="group relative block aspect-3/4 overflow-hidden">
                <div className="bg-muted absolute inset-0 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
                <div className="absolute inset-0 flex items-end justify-center pb-12">
                  <span className="bg-background px-8 py-3 text-xs tracking-widest uppercase transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    {label}
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
