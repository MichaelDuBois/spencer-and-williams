import {
  ContentPDPPills,
  type ContentPDPPill,
} from '@/app/b2b-content/_components/pdpComponents/ContentPDPPills'
import type { B2BContentResourceHitValues } from '@/app/b2b-content/hitValues.types'

const getPills = (resource: B2BContentResourceHitValues): ContentPDPPill[] => [
  ...(resource.docType
    ? [{ label: resource.docType, variant: 'accent' as const }]
    : []),
  ...(resource.relatedProducts?.map((product) => {
    return { label: product, variant: 'outline' as const }
  }) ?? []),
  ...(resource.relatedIndustries?.map((industry) => {
    return { label: industry, variant: 'outline' as const }
  }) ?? []),
  ...(resource.relatedUseCases?.map((useCase) => {
    return { label: useCase, variant: 'outline' as const }
  }) ?? []),
]

export const B2BResourcePills = ({
  resource,
}: {
  resource: B2BContentResourceHitValues
}) => {
  const pills = getPills(resource)

  return <ContentPDPPills pills={pills} />
}
