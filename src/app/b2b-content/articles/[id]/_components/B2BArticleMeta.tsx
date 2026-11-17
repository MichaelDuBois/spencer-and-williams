import { Clock, ThumbsUp } from 'lucide-react'

import type { B2BContentArticleHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BArticleMeta = ({
  article,
}: {
  article: B2BContentArticleHitValues
}) => {
  const hasVotes = typeof article.voteSum === 'number'

  if (!article.updatedAt && !hasVotes) return null

  return (
    <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      {article.updatedAt && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Updated {article.updatedAt}
        </span>
      )}
      {hasVotes && (
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
          {article.voteSum}
          {typeof article.voteCount === 'number' && (
            <span className="text-muted-foreground/70">
              {' '}
              / {article.voteCount} votes
            </span>
          )}
        </span>
      )}
    </div>
  )
}
