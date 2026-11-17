import { ContentPDPHeroImage } from '@/app/b2b-content/_components/pdpComponents/ContentPDPHeroImage'
import type { B2BContentResourceHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BResourceHeroImage = ({
  resource,
}: {
  resource: B2BContentResourceHitValues
}) => <ContentPDPHeroImage imageUrl={resource.image} alt={resource.title} />
