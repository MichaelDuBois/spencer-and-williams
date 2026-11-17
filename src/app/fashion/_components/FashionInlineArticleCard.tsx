import { Clock } from 'lucide-react'
import Link from 'next/link'

import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { Image } from '@/components/image/Image'

interface FashionInlineArticleCardProps {
  article: FashionArticleHitValues
  /** Link target that replaces the article's own detail-page URL. */
  urlOverride?: string
}

export const FashionInlineArticleCard = ({
  article,
  urlOverride,
}: FashionInlineArticleCardProps) => {
  const hasReadingTime = article.readingTime != null
  const hasMetadata = Boolean(article.category) || hasReadingTime

  return (
    <Link
      href={urlOverride ?? article.productUrl}
      className="group block h-full w-full text-left">
      <article className="bg-muted rounded-image relative aspect-3/4 overflow-hidden text-white">
        <Image
          src={article.thumbnail ?? article.image}
          alt={article.title}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5 transition-colors duration-500 group-hover:from-black"
        />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {hasMetadata && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[0.625rem] tracking-widest text-white/80 uppercase">
              {article.category && <span>{article.category}</span>}
              {article.category && hasReadingTime && <span aria-hidden>·</span>}
              {hasReadingTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden className="h-3 w-3" />
                  {article.readingTime} min read
                </span>
              )}
            </div>
          )}

          <h3 className="font-secondary line-clamp-3 text-sm leading-snug sm:text-base xl:text-lg">
            {article.title}
          </h3>
          <span className="mt-4 inline-block text-[0.625rem] tracking-[0.2em] text-white/90 uppercase underline decoration-white/40 underline-offset-4">
            Read the story
          </span>
        </div>
      </article>
    </Link>
  )
}
