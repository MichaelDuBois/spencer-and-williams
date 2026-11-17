import {
  HEADER_SECTIONS,
  getHeaderSection,
} from '@/app/media-entertainment/_utils/headerSections'
import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import { MediaEntertainmentSectionResults } from '@/app/media-entertainment/search/_components/MediaEntertainmentSectionResults'
import { PdpNotFoundState } from '@/components/pdp/PdpNotFoundState'

interface SectionPageProps {
  params: Promise<{ section: string }>
}

// The sections come from config, so every valid segment is known at build.
export const generateStaticParams = () =>
  HEADER_SECTIONS.map(({ id }) => {
    return { section: id }
  })

// Resolving on the server keeps an unknown segment out of the client render.
const SectionPage = async ({ params }: SectionPageProps) => {
  const { section: sectionId } = await params
  const section = getHeaderSection(sectionId)

  if (!section) {
    return (
      <PdpNotFoundState
        title="Section not found"
        backHref={`/${config.slug}`}
        backLabel="Back to browse"
      />
    )
  }

  return <MediaEntertainmentSectionResults section={section} />
}

export default SectionPage
