import { ExternalLink } from 'lucide-react'

import type { B2BContentArticleHitValues } from '@/app/b2b-content/hitValues.types'
import { Button } from '@/components/ui/button/Button'

export const B2BArticleCta = ({
  article,
}: {
  article: B2BContentArticleHitValues
}) => {
  if (!article.url) return null

  return (
    <div className="mt-10">
      <Button asChild size="lg">
        <a href={article.url} target="_blank" rel="noreferrer">
          Read on support
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  )
}
