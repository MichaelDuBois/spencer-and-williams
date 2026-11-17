'use client'

import type { ArticleHitValues } from '@/app/travel/hitValues.types'
import { Image } from '@/components/image/Image'
import { cn } from '@/lib/utils'

interface TravelMapArticleCardProps {
  article: ArticleHitValues
  isHovered: boolean
  isSelected: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}

export const TravelMapArticleCard = ({
  article,
  isHovered,
  isSelected,
  onHover,
  onSelect,
}: TravelMapArticleCardProps) => {
  const duration = article.recommendedDurationDays
    ? `${article.recommendedDurationDays}d`
    : null

  return (
    <button
      type="button"
      onClick={() => onSelect(article.objectID)}
      onMouseEnter={() => onHover(article.objectID)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'group rounded-image relative aspect-4/3 w-full cursor-pointer overflow-hidden text-left shadow-md transition-shadow',
        'hover:shadow-xl',
        (isHovered || isSelected) && 'ring-accent ring-2 ring-offset-2',
      )}>
      <Image
        src={article.image}
        alt={article.title}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 p-3 text-white">
        <div className="line-clamp-2 text-sm leading-tight font-semibold">
          {article.title}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs opacity-90">
          {article.location && <span>{article.location}</span>}
          {duration && (
            <>
              {article.location && <span>·</span>}
              <span>{duration}</span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}
