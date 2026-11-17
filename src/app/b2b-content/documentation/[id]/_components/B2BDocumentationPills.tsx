import {
  ContentPDPPills,
  type ContentPDPPill,
} from '@/app/b2b-content/_components/pdpComponents/ContentPDPPills'
import type { B2BContentDocumentationHitValues } from '@/app/b2b-content/hitValues.types'

const getPills = (doc: B2BContentDocumentationHitValues): ContentPDPPill[] => [
  ...(doc.docType ? [{ label: doc.docType, variant: 'accent' as const }] : []),
  ...(doc.variations?.map((variation) => {
    return { label: variation, variant: 'outline' as const }
  }) ?? []),
]

export const B2BDocumentationPills = ({
  doc,
}: {
  doc: B2BContentDocumentationHitValues
}) => {
  const pills = getPills(doc)

  return <ContentPDPPills pills={pills} />
}
