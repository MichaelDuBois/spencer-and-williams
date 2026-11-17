import { LifeBuoy } from 'lucide-react'

import { ContentBreadcrumb } from '@/app/b2b-content/_components/ContentBreadcrumb'
import { ContentPDPTitleHeading } from '@/app/b2b-content/_components/pdpComponents/ContentPDPTitleHeading'
import type { B2BContentArticleHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BArticleHeader = ({
  article,
}: {
  article: B2BContentArticleHitValues
}) => (
  <header>
    <ContentBreadcrumb items={article.breadcrumb} />

    {article.category && (
      <ContentPDPTitleHeading>{article.category}</ContentPDPTitleHeading>
    )}

    <h1 className="text-foreground flex items-start gap-3 text-3xl leading-tight font-bold md:text-4xl">
      <span
        className="bg-accent/10 text-accent mt-1 inline-flex shrink-0 items-center justify-center rounded-md p-2"
        aria-hidden="true">
        <LifeBuoy className="h-6 w-6" />
      </span>
      <span>{article.title}</span>
    </h1>
  </header>
)
