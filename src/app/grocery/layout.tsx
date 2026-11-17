import { GroceryFooter } from '@/app/grocery/_components/GroceryFooter'
import { GroceryHeader } from '@/app/grocery/_components/GroceryHeader'
import { groceryConfig as config } from '@/app/grocery/config'
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
    <GroceryHeader />
    <main className="flex-1">
      <AIAssistantLayout basePath={basePath}>{children}</AIAssistantLayout>
    </main>
    <GroceryFooter />
  </Providers>
)

export default Layout
