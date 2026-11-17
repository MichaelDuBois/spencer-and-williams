'use client'

import { Carousel } from '@/components/Carousel'
import { useMultifeedComposition } from '@/hooks/useMultifeedComposition'
import type { MultifeedHit } from '@/lib/multifeed-composition'
import { cn } from '@/lib/utils'

interface MultifeedCarouselsProps {
  renderItem: (hit: MultifeedHit, indexName: string) => React.ReactNode
  getItemClassName?: (indexName: string) => string | undefined
  className?: string
}

export const MultifeedCarousels = ({
  renderItem,
  getItemClassName,
  className,
}: MultifeedCarouselsProps) => {
  const { data: feeds } = useMultifeedComposition()

  if (!feeds?.length) return null

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {feeds.map((feed) => {
        const itemClass = getItemClassName?.(feed.indexName) ?? 'w-72'
        return (
          <section key={feed.feedId} className="bg-muted/50 rounded-card p-4">
            <h2 className="text-foreground mb-8 text-xl font-bold">
              {feed.title}
            </h2>
            <Carousel>
              {feed.hits.map((hit) => (
                <div key={hit.objectID} className={cn(itemClass, 'shrink-0')}>
                  {renderItem(hit, feed.indexName)}
                </div>
              ))}
            </Carousel>
          </section>
        )
      })}
    </div>
  )
}
