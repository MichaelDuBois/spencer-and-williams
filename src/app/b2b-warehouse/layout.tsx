import { B2BWarehouseAssistantLayout } from '@/app/b2b-warehouse/_components/B2BWarehouseAssistantLayout'
import { B2BWarehouseFooter } from '@/app/b2b-warehouse/_components/B2BWarehouseFooter'
import { B2BWarehouseHeader } from '@/app/b2b-warehouse/_components/B2BWarehouseHeader'
import { b2bWarehouseConfig as config } from '@/app/b2b-warehouse/config'
import { Providers } from '@/components/providers/Providers'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: `S&W - ${config.name}`,
  icons: {
    icon: config.assets.favicon,
  },
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <Providers config={config}>
    <B2BWarehouseHeader />
    <main className="flex-1">
      <B2BWarehouseAssistantLayout>{children}</B2BWarehouseAssistantLayout>
    </main>
    <B2BWarehouseFooter />
  </Providers>
)

export default Layout
