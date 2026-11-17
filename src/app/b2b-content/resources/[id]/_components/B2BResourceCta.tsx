import { ContentPDPExternalCta } from '@/app/b2b-content/_components/pdpComponents/ContentPDPExternalCta'
import type { B2BContentResourceHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BResourceCta = ({
  resource,
}: {
  resource: B2BContentResourceHitValues
}) => (
  <ContentPDPExternalCta href={resource.url}>
    View resource
  </ContentPDPExternalCta>
)
