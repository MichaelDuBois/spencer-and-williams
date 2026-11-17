import { LayoutGroup } from 'motion/react'

import { TravelFooter } from '@/app/travel/_components/TravelFooter'
import { TravelHeader } from '@/app/travel/_components/TravelHeader'
import { travelConfig as config } from '@/app/travel/config'
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
    <LayoutGroup>
      <TravelHeader />
      <main className="flex-1">
        <AIAssistantLayout basePath={basePath}>{children}</AIAssistantLayout>
      </main>
      <TravelFooter />
    </LayoutGroup>
  </Providers>
)

export default Layout
