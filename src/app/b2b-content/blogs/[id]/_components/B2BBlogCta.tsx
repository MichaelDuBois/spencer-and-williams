import { ContentPDPExternalCta } from '@/app/b2b-content/_components/pdpComponents/ContentPDPExternalCta'
import type { B2BContentBlogHitValues } from '@/app/b2b-content/hitValues.types'

export const B2BBlogCta = ({ blog }: { blog: B2BContentBlogHitValues }) => (
  <ContentPDPExternalCta href={blog.url}>Read on Algolia</ContentPDPExternalCta>
)
