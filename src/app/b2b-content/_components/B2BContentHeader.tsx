'use client'

import { b2bContentConfig as config } from '@/app/b2b-content/config'
import { Header } from '@/components/header/Header'
import { DemoOptions } from '@/components/options/DemoOptions'
import { PersonaSwitcher } from '@/components/PersonaSwitcher'
import { SearchInput } from '@/components/search/SearchInput'

const basePath = `/${config.slug}`

export const B2BContentHeader = () => (
  <Header variant="standard" logo={config.assets.logo} basePath={basePath}>
    <Header.CenterSection>
      <div className="w-full max-w-2xl">
        <SearchInput
          basePath={basePath}
          placeholder="What can we help you find today?"
        />
      </div>
    </Header.CenterSection>
    <Header.RightSection>
      <DemoOptions />
      <PersonaSwitcher basePath={basePath} />
    </Header.RightSection>
  </Header>
)
