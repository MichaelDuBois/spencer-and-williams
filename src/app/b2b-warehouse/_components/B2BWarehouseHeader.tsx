import { b2bWarehouseConfig as config } from '@/app/b2b-warehouse/config'
import { AutocompleteWidget } from '@/components/autocomplete/AutocompleteWidget'
import { CategoryNav } from '@/components/header/CategoryNav'
import { Header } from '@/components/header/Header'
import { DemoOptions } from '@/components/options/DemoOptions'
import { PersonaSwitcher } from '@/components/PersonaSwitcher'
import { StoreLocatorHeaderButton } from '@/components/storeLocator/StoreLocatorHeaderButton'
import { CartBadge } from '@/components/ui/CartBadge'

const basePath = `/${config.slug}`

export const B2BWarehouseHeader = () => (
  <>
    <Header variant="standard" logo={config.assets.logo} basePath={basePath}>
      <Header.CenterSection>
        <AutocompleteWidget
          basePath={basePath}
          placeholder="Search tools, safety gear, fasteners…"
          showSuggestions
          showAISuggestions
          showSku
          showAIButton
        />
      </Header.CenterSection>
      <Header.RightSection>
        <DemoOptions />
        <PersonaSwitcher basePath={basePath} />
        <StoreLocatorHeaderButton basePath={basePath} />
        <CartBadge href={`${basePath}/cart`} />
      </Header.RightSection>
    </Header>
    <CategoryNav navigation={config.navigation} basePath={basePath} />
  </>
)
