import { ElectronicsFooter } from '@/app/electronics/_components/ElectronicsFooter'
import { ElectronicsHeader } from '@/app/electronics/_components/ElectronicsHeader'
import { electronicsConfig as config } from '@/app/electronics/config'
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
    <ElectronicsHeader />
    <main className="flex-1">
      <AIAssistantLayout basePath={basePath}>{children}</AIAssistantLayout>
    </main>
    <ElectronicsFooter />
  </Providers>
)

export default Layout
