import '@/app/globals.css'

import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { DemoBar } from '@/components/DemoBar'
import { hasStagingConfig } from '@/lib/resolve-vertical-config'
import { QueryProvider } from '@/providers/QueryProvider'
import { verticals } from '@/verticals'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'S&W',
  icons: {
    icon: 'images/favicon.svg',
  },
  robots: {
    index: false,
    follow: false,
  },
}

// Only the fields DemoBar renders — keeps the full configs out of the client payload.
const demoBarVerticals = verticals.map(({ config }) => {
  return {
    config: {
      slug: config.slug,
      name: config.name,
      theme: config.theme,
      darkMode: config.darkMode,
    },
    hasStaging: hasStagingConfig(config),
  }
})

const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => (
  <html lang="en">
    <body>
      <QueryProvider>
        <DemoBar verticals={demoBarVerticals} />
        {children}
      </QueryProvider>
      {googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId} />}
    </body>
  </html>
)

export default RootLayout
