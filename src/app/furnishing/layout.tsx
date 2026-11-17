import { FurnishingFooter } from '@/app/furnishing/_components/FurnishingFooter'
import { FurnishingHeader } from '@/app/furnishing/_components/FurnishingHeader'
import { furnishingConfig as config } from '@/app/furnishing/config'
import { Providers } from '@/components/providers/Providers'
import { AIAssistantLayout } from '@/features/aiAssistant'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `S&W - ${config.name}`,
  icons: { icon: config.assets.favicon },
}

const basePath = `/${config.slug}`

const Layout = ({ children }: { children: React.ReactNode }) => (
  <Providers config={config}>
    <FurnishingHeader />
    <main className="flex-1">
      <AIAssistantLayout basePath={basePath}>{children}</AIAssistantLayout>
    </main>
    <FurnishingFooter />
  </Providers>
)

export default Layout
