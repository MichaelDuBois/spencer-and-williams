import { Pin } from 'lucide-react'

import {
  ContentPDPPills,
  type ContentPDPPill,
} from '@/app/b2b-content/_components/pdpComponents/ContentPDPPills'
import type { B2BContentArticleHitValues } from '@/app/b2b-content/hitValues.types'

const getPills = (article: B2BContentArticleHitValues): ContentPDPPill[] => [
  ...(article.promoted
    ? [
        {
          label: 'Featured',
          variant: 'accent' as const,
          icon: <Pin className="h-3 w-3" aria-hidden="true" />,
        },
      ]
    : []),
  ...(article.labels?.map((label) => {
    return { label, variant: 'outline' as const }
  }) ?? []),
]

export const B2BArticlePills = ({
  article,
}: {
  article: B2BContentArticleHitValues
}) => {
  const pills = getPills(article)

  return <ContentPDPPills pills={pills} />
}
