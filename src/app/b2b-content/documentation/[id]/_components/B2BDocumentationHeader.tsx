import { ContentBreadcrumb } from '@/app/b2b-content/_components/ContentBreadcrumb'
import { ContentPDPTitleHeading } from '@/app/b2b-content/_components/pdpComponents/ContentPDPTitleHeading'
import { getDocumentationTypeIcon } from '@/app/b2b-content/_utils/getDocumentationTypeIcon'
import type { B2BContentDocumentationHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BDocumentationHeader = ({
  doc,
}: {
  doc: B2BContentDocumentationHitValues
}) => (
  <header>
    <ContentBreadcrumb items={doc.breadcrumb} />

    {doc.pageTitle && (
      <ContentPDPTitleHeading>{doc.pageTitle}</ContentPDPTitleHeading>
    )}

    <h1 className="text-foreground flex items-start gap-3 text-3xl leading-tight font-bold md:text-4xl">
      <span
        className="bg-accent/10 text-accent mt-1 inline-flex shrink-0 items-center justify-center rounded-md p-2"
        aria-hidden="true">
        {getDocumentationTypeIcon(doc.docType, { className: 'h-6 w-6' })}
      </span>
      <span>{doc.title}</span>
    </h1>
  </header>
)
