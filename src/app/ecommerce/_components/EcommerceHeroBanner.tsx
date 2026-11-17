'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

import { ecommerceConfig } from '@/app/ecommerce/config'
import { enterFadeIn, transitionSlow } from '@/lib/animations'

export const EcommerceHeroBanner = () => {
  const bannerImage = ecommerceConfig.assets?.banner

  return (
    <section className="relative mb-16 flex min-h-80 items-center overflow-hidden md:max-h-120 md:min-h-[50vh]">
      {bannerImage && (
        <Image
          src={bannerImage}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_center]"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-black/20 md:from-black/50 md:via-black/20 md:to-transparent"
      />
      <div className="relative container mx-auto px-6">
        <div className="max-w-xl">
          <motion.p
            {...enterFadeIn()}
            transition={{ ...transitionSlow, delay: 0.2 }}
            className="mb-4 text-sm font-medium tracking-widest text-white/80 uppercase">
            Save up to 30%
          </motion.p>
          <motion.h1
            {...enterFadeIn(24)}
            transition={{ ...transitionSlow, delay: 0.4 }}
            className="text-5xl leading-tight font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
            Today&apos;s Best Deals
          </motion.h1>
          <motion.p
            {...enterFadeIn()}
            transition={{ ...transitionSlow, delay: 0.6 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-white/85">
            Save big on electronics, home, and more.
          </motion.p>
          <motion.div
            {...enterFadeIn(0)}
            transition={{ ...transitionSlow, delay: 0.8 }}>
            <Link
              href="/ecommerce/search"
              className="bg-accent text-accent-foreground rounded-button group relative mt-8 inline-block overflow-hidden px-8 py-3 text-sm font-medium transition-opacity hover:opacity-90">
              <span
                aria-hidden
                className="absolute top-0 -left-full h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent transition-all duration-700 ease-out group-hover:left-[150%]"
              />
              <span className="relative z-10">Shop Deals</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
