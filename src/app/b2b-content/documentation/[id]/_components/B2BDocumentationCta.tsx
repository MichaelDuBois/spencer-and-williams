import { ContentPDPExternalCta } from '@/app/b2b-content/_components/pdpComponents/ContentPDPExternalCta'
import type { B2BContentDocumentationHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BDocumentationCta = ({
  doc,
}: {
  doc: B2BContentDocumentationHitValues
}) => <ContentPDPExternalCta href={doc.url}>Read more</ContentPDPExternalCta>
