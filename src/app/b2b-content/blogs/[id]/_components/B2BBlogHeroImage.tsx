import { ContentPDPHeroImage } from '@/app/b2b-content/_components/pdpComponents/ContentPDPHeroImage'
import type { B2BContentBlogHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BBlogHeroImage = ({
  blog,
}: {
  blog: B2BContentBlogHitValues
}) => <ContentPDPHeroImage imageUrl={blog.image} alt={blog.title} />
