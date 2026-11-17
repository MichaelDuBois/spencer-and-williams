'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

import { furnishingConfig } from '@/app/furnishing/config'
import { enterFadeIn, transitionSlow } from '@/lib/animations'

export const FurnishingHeroBanner = () => {
  const bannerImage = furnishingConfig.assets?.banner

  return (
    <section className="relative flex min-h-[75vh] items-center overflow-hidden">
      {bannerImage ? (
        <Image
          src={bannerImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="from-accent/10 via-secondary to-background absolute inset-0 bg-linear-to-br" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent"
      />
      <div className="relative container mx-auto px-6">
        <div className="max-w-xl">
          <motion.p
            {...enterFadeIn()}
            transition={{ ...transitionSlow, delay: 0.2 }}
            className="text-accent mb-4 text-sm font-medium tracking-widest uppercase">
            Designed for Living
          </motion.p>
          <motion.h1
            {...enterFadeIn(24)}
            transition={{ ...transitionSlow, delay: 0.4 }}
            className="text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl">
            Furniture &
            <br />
            Home Décor
          </motion.h1>
          <motion.p
            {...enterFadeIn()}
            transition={{ ...transitionSlow, delay: 0.6 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-white/85">
            Thoughtfully crafted pieces for living rooms, bedrooms, and every
            corner in between.
          </motion.p>
          <motion.div
            {...enterFadeIn(0)}
            transition={{ ...transitionSlow, delay: 0.8 }}>
            <Link
              href="/furnishing/search"
              className="bg-accent text-accent-foreground rounded-button group relative mt-8 inline-block overflow-hidden px-8 py-3 text-sm font-medium transition-opacity hover:opacity-90">
              <span
                aria-hidden
                className="absolute top-0 -left-full h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent transition-all duration-700 ease-out group-hover:left-[150%]"
              />
              <span className="relative z-10">Shop Now</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
