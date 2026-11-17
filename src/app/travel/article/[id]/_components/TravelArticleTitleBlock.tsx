import { Clock3 } from 'lucide-react'

import { formatDate } from '@/app/travel/_utils/travelContentFormatters'

export const TravelArticleTitleBlock = ({
  title,
  subtitle,
  author,
  date,
  readTime,
}: {
  title: string
  subtitle?: string
  author?: string
  date?: string
  readTime?: number
}) => {
  const byline = author || 'Spencer & Williams'

  return (
    <>
      <h1 className="text-foreground mt-4 text-3xl leading-[0.95] font-light tracking-tight text-balance md:text-5xl lg:text-[4rem]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground mt-4 text-base leading-7 italic md:text-[1.2rem] md:leading-8">
          {subtitle}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <p className="text-foreground font-medium">{byline}</p>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2">
          {date && <span>{formatDate(date)}</span>}
          {readTime !== undefined && (
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {readTime} min read
            </span>
          )}
        </div>
      </div>
    </>
  )
}
