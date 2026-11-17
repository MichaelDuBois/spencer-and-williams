import { EcommerceFooter } from '@/app/ecommerce/_components/EcommerceFooter'
import { EcommerceHeader } from '@/app/ecommerce/_components/EcommerceHeader'
import { ecommerceConfig as config } from '@/app/ecommerce/config'
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
    <EcommerceHeader />
    <main className="flex-1">
      <AIAssistantLayout basePath={basePath}>{children}</AIAssistantLayout>
    </main>
    <EcommerceFooter />
  </Providers>
)

export default Layout
