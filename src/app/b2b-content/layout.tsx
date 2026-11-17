import { B2BContentFooter } from '@/app/b2b-content/_components/B2BContentFooter'
import { B2BContentHeader } from '@/app/b2b-content/_components/B2BContentHeader'
import { b2bContentConfig as config } from '@/app/b2b-content/config'
import { Providers } from '@/components/providers/Providers'
import { AIAssistantLayout } from '@/features/aiAssistant/components/AIAssistantLayout'

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
    <B2BContentHeader />
    <main className="flex-1">
      <AIAssistantLayout basePath={basePath}>{children}</AIAssistantLayout>
    </main>
    <B2BContentFooter />
  </Providers>
)

export default Layout
