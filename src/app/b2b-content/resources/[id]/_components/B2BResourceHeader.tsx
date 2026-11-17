import { CalendarDays, LibraryBig } from 'lucide-react'

import { ContentBreadcrumb } from '@/app/b2b-content/_components/ContentBreadcrumb'
import { ContentPDPTitleHeading } from '@/app/b2b-content/_components/pdpComponents/ContentPDPTitleHeading'
import type { B2BContentResourceHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BResourceHeader = ({
  resource,
}: {
  resource: B2BContentResourceHitValues
}) => {
  const label = resource.contentType?.[0] ?? resource.docType ?? null
  const breadcrumbItems = ['Algolia Resources', label].filter(
    Boolean,
  ) as string[]

  return (
    <header>
      <ContentBreadcrumb items={breadcrumbItems} />

      {label && <ContentPDPTitleHeading>{label}</ContentPDPTitleHeading>}

      <h1 className="text-foreground flex items-start gap-3 text-3xl leading-tight font-bold md:text-4xl">
        <span
          className="bg-accent/10 text-accent mt-1 inline-flex shrink-0 items-center justify-center rounded-md p-2"
          aria-hidden="true">
          <LibraryBig className="h-6 w-6" />
        </span>
        <span>{resource.title}</span>
      </h1>

      {resource.description && (
        <p className="text-muted-foreground mt-5 text-base leading-relaxed md:text-lg">
          {resource.description}
        </p>
      )}

      {resource.publishedAt && (
        <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {resource.publishedAt}
          </span>
        </div>
      )}
    </header>
  )
}
