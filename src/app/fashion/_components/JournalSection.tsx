'use client'

import { motion } from 'motion/react'

import { JournalCard } from '@/app/fashion/_components/JournalCard'
import { useFashionArticles } from '@/app/fashion/_hooks/useFashionArticles'
import {
  DURATION_LAYOUT,
  EASE_SMOOTH,
  scrollFadeIn,
  scrollScaleX,
  transitionSlow,
} from '@/lib/animations'

const SEPARATOR_TRANSITION = { duration: DURATION_LAYOUT, ease: EASE_SMOOTH }
const JOURNAL_ARTICLE_COUNT = 3

const GRID_CLASSES =
  'mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3'

const LoadingSkeleton = () => (
  <div className={GRID_CLASSES}>
    {Array.from({ length: JOURNAL_ARTICLE_COUNT }).map((_, index) => (
      <div
        key={index}
        className="mx-auto w-full max-w-xs space-y-4 md:max-w-none">
        <div className="bg-muted rounded-image aspect-3/4 w-full animate-pulse" />
        <div className="bg-muted h-3 w-1/3 animate-pulse" />
        <div className="bg-muted h-5 w-3/4 animate-pulse" />
      </div>
    ))}
  </div>
)

export const JournalSection = () => {
  const { articles, isLoading } = useFashionArticles({
    key: 'journal-articles',
    count: JOURNAL_ARTICLE_COUNT,
  })

  if (!isLoading && articles.length === 0) return null

  return (
    <section className="bg-muted/50 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <motion.div
            {...scrollScaleX}
            transition={SEPARATOR_TRANSITION}
            className="bg-foreground mx-auto mb-8 h-px w-16 origin-center"
          />
          <motion.h2
            {...scrollFadeIn()}
            transition={transitionSlow}
            className="font-secondary text-3xl tracking-[0.15em] uppercase">
            The Journal
          </motion.h2>
          <motion.p
            {...scrollFadeIn()}
            transition={{ ...transitionSlow, delay: 0.1 }}
            className="text-muted-foreground mx-auto mt-6 max-w-xl text-sm leading-relaxed">
            Explore our latest editorials, designer interviews, and
            behind-the-scenes stories from the world of fashion.
          </motion.p>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className={GRID_CLASSES}>
            {articles.map((article, index) => (
              <motion.div
                key={article.objectID}
                {...scrollFadeIn(24)}
                transition={{ ...transitionSlow, delay: index * 0.15 }}>
                <JournalCard article={article} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
