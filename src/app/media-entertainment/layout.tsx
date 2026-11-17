import { MediaEntertainmentFooter } from '@/app/media-entertainment/_components/MediaEntertainmentFooter'
import { MediaEntertainmentHeader } from '@/app/media-entertainment/_components/MediaEntertainmentHeader'
import { MediaEntertainmentProfileGate } from '@/app/media-entertainment/_components/MediaEntertainmentProfileGate'
import { MediaEntertainmentTitleModal } from '@/app/media-entertainment/_components/MediaEntertainmentTitleModal'
import { MediaEntertainmentViewerContext } from '@/app/media-entertainment/_components/MediaEntertainmentViewerContext'
import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import { Providers } from '@/components/providers/Providers'
import { AIAssistantLayout } from '@/features/aiAssistant'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `S&W - ${config.name}`,
  icons: {
    icon: config.assets.favicon,
  },
}

const basePath = `/${config.slug}`

const Layout = ({ children }: { children: React.ReactNode }) => (
  <Providers config={config}>
    <MediaEntertainmentHeader />
    <main className="flex-1 pt-[var(--header-height)]">
      <AIAssistantLayout basePath={basePath}>{children}</AIAssistantLayout>
    </main>
    <MediaEntertainmentFooter />
    {/* Mounted once here so a poster card on any media route can open it. */}
    <MediaEntertainmentTitleModal />
    {/* Restores the persisted profile and gates entry on picking one. */}
    <MediaEntertainmentProfileGate />
    {/* Tells the assistant who is watching. Renders nothing. */}
    <MediaEntertainmentViewerContext />
  </Providers>
)

export default Layout
