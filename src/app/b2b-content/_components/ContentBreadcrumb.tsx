import { ChevronRight } from 'lucide-react'

import { b2bContentConfig } from '@/app/b2b-content/config'
import { BackToResults } from '@/components/BackToResults'

interface ContentBreadcrumbProps {
  items: string[]
}

export const ContentBreadcrumb = ({ items }: ContentBreadcrumbProps) => {
  const { slug } = b2bContentConfig

  return (
    <>
      <BackToResults fallbackHref={`/${slug}/search`} />
      {items.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="text-muted-foreground mb-6 flex cursor-default flex-wrap items-center gap-1.5 text-xs select-none">
          {items.map((crumb, i) => (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
              <span>{crumb}</span>
            </span>
          ))}
        </nav>
      )}
    </>
  )
}
