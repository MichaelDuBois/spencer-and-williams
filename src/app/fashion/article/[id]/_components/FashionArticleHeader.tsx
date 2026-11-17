import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'
import { Image } from '@/components/image/Image'
import { formatDate } from '@/utilities/formatDate'

export const FashionArticleHeader = ({
  article,
}: {
  article: FashionArticleHitValues
}) => {
  const publishedAt = formatDate(article.publishedAt)
  const byline = [
    article.author?.name,
    article.author?.role,
    publishedAt,
    article.readingTime ? `${article.readingTime} min read` : null,
  ].filter(Boolean)

  return (
    <header>
      <div className="bg-muted rounded-image relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          preload
          sizes="(min-width: 1024px) 992px, calc(100vw - 2rem)"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto mt-10 max-w-2xl md:mt-12">
        {article.category && (
          <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
            {article.category}
          </p>
        )}
        <h1 className="font-secondary mt-6 text-3xl leading-tight md:text-4xl">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="text-muted-foreground mt-6 text-base leading-relaxed capitalize">
            {article.subtitle}
          </p>
        )}

        {byline.length > 0 && (
          <p className="text-muted-foreground mt-8 text-xs tracking-widest uppercase">
            {byline.join(' · ')}
          </p>
        )}

        {article.seasonality && article.seasonality.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {article.seasonality.map((season) => (
              <li
                key={season}
                className="border-border text-muted-foreground rounded-badge border px-3 py-1 text-xs tracking-widest uppercase">
                {season}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-foreground mx-auto mt-16 h-px w-16" />
    </header>
  )
}
