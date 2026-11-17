'use client'

import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'

import { TravelMapHeaderButton } from '@/app/travel/_components/TravelMapHeaderButton'
import { TravelSearchInput } from '@/app/travel/_components/TravelSearchInput'
import { travelConfig as config } from '@/app/travel/config'
import { Header } from '@/components/header/Header'
import { DemoOptions } from '@/components/options/DemoOptions'
import { PersonaSwitcher } from '@/components/PersonaSwitcher'
import { EASE_LAYOUT, DURATION_LAYOUT } from '@/lib/animations'

const basePath = `/${config.slug}`

export const TravelHeader = () => {
  const pathname = usePathname()
  const isHomePage = pathname === basePath || pathname === `${basePath}/`

  return (
    <Header variant="standard" logo={config.assets.logo} basePath={basePath}>
      <Header.CenterSection>
        <div className="w-full max-w-2xl">
          {!isHomePage && (
            <motion.div
              layoutId="travel-searchbox"
              transition={{
                layout: {
                  duration: DURATION_LAYOUT,
                  ease: EASE_LAYOUT,
                },
              }}>
              <TravelSearchInput basePath={basePath} />
            </motion.div>
          )}
        </div>
      </Header.CenterSection>
      <Header.RightSection>
        <DemoOptions />
        <PersonaSwitcher basePath={basePath} />
        <TravelMapHeaderButton basePath={basePath} />
      </Header.RightSection>
    </Header>
  )
}
