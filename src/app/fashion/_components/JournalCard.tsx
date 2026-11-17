import Link from 'next/link'

import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { Image } from '@/components/image/Image'

const DEFAULT_IMAGE_SIZES =
  '(min-width: 1024px) 280px, (min-width: 768px) 30vw, 320px'

interface JournalCardProps {
  article: FashionArticleHitValues
  /** Override when the card sits in a grid wider than the homepage journal. */
  imageSizes?: string
}

export const JournalCard = ({
  article,
  imageSizes = DEFAULT_IMAGE_SIZES,
}: JournalCardProps) => {
  const meta: string[] = []
  if (article.category) meta.push(article.category)
  if (article.readingTime) meta.push(`${article.readingTime} min read`)

  return (
    <Link
      href={article.productUrl}
      className="group mx-auto block w-full max-w-xs text-left md:max-w-none">
      <div className="bg-muted rounded-image relative aspect-3/4 overflow-hidden">
        <Image
          src={article.thumbnail ?? article.image}
          alt={article.title}
          fill
          sizes={imageSizes}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      {meta.length > 0 && (
        <p className="text-muted-foreground mt-5 text-xs tracking-[0.3em] uppercase">
          {meta.join(' · ')}
        </p>
      )}
      <h3 className="font-secondary mt-3 text-lg leading-snug">
        {article.title}
      </h3>
    </Link>
  )
}
