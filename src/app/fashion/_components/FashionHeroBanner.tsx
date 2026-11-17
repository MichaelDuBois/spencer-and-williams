'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

import { fashionConfig } from '@/app/fashion/config'
import { enterFadeIn, transitionSlow } from '@/lib/animations'

export const FashionHeroBanner = () => {
  const { assets } = fashionConfig
  const bannerImage = assets?.banner

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      {bannerImage && (
        <Image
          src={bannerImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50"
      />
      <div className="relative text-center text-white">
        <motion.p
          {...enterFadeIn()}
          transition={{ ...transitionSlow, delay: 0.2 }}
          className="mb-4 text-xs tracking-[0.3em] text-white/80 uppercase">
          Spring/Summer 2026
        </motion.p>
        <motion.h1
          {...enterFadeIn(24)}
          transition={{ ...transitionSlow, delay: 0.4 }}
          className="font-secondary text-5xl tracking-[0.2em] uppercase md:text-7xl">
          New Collection
        </motion.h1>
        <motion.p
          {...enterFadeIn()}
          transition={{ ...transitionSlow, delay: 0.6 }}
          className="mt-6 text-sm leading-relaxed text-white/85">
          Discover timeless elegance in our latest curated pieces
        </motion.p>
        <motion.div
          {...enterFadeIn(0)}
          transition={{ ...transitionSlow, delay: 0.8 }}>
          <Link
            href="/fashion/search"
            className="group relative mt-8 inline-block overflow-hidden border border-white px-12 py-4 text-xs tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black">
            <span
              aria-hidden
              className="absolute top-0 -left-full h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 ease-out group-hover:left-[150%]"
            />
            <span className="relative z-10">Explore</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
