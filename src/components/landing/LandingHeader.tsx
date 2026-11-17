import Image from 'next/image'

import { AlgoliaEnvironmentToggle } from '@/components/options/AlgoliaEnvironmentToggle'
import { hasStagingConfig } from '@/lib/resolve-vertical-config'
import { verticals } from '@/verticals'

const showEnvironmentToggle = verticals.some(({ config }) =>
  hasStagingConfig(config),
)

export const LandingHeader = () => (
  <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
    <div className="container mx-auto flex items-start justify-between gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Spencer & Williams
        </h1>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Powered by</span>
          <Image
            src="/images/algolia/Algolia-logo-blue.svg"
            alt="Algolia"
            width={64}
            height={15}
          />
        </div>
      </div>
      {showEnvironmentToggle && <AlgoliaEnvironmentToggle className="mt-1" />}
    </div>
  </header>
)
