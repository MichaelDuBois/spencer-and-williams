import { FashionFooter } from '@/app/fashion/_components/FashionFooter'
import { FashionHeader } from '@/app/fashion/_components/FashionHeader'
import { fashionConfig as config } from '@/app/fashion/config'
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
    <FashionHeader />
    <main className="flex-1">
      <AIAssistantLayout basePath={basePath}>{children}</AIAssistantLayout>
    </main>
    <FashionFooter />
  </Providers>
)

export default Layout
