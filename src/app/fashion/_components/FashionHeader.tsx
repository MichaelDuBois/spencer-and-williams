import { FashionAutocomplete } from '@/app/fashion/_components/FashionAutocomplete'
import { fashionConfig as config } from '@/app/fashion/config'
import { CategoryNav } from '@/components/header/CategoryNav'
import { Header } from '@/components/header/Header'
import { DemoOptions } from '@/components/options/DemoOptions'
import { PersonaSwitcher } from '@/components/PersonaSwitcher'
import { StoreLocatorHeaderButton } from '@/components/storeLocator/StoreLocatorHeaderButton'
import { CartBadge } from '@/components/ui/CartBadge'

const basePath = `/${config.slug}`

export const FashionHeader = () => (
  <>
    <Header variant="editorial" logo={config.assets.logo} basePath={basePath}>
      <Header.CenterSection>
        <FashionAutocomplete basePath={basePath} />
      </Header.CenterSection>
      <Header.RightSection>
        <DemoOptions />
        <PersonaSwitcher basePath={basePath} />
        <StoreLocatorHeaderButton basePath={basePath} />
        <CartBadge href={`${basePath}/cart`} />
      </Header.RightSection>
    </Header>
    <CategoryNav
      navigation={config.navigation}
      basePath={basePath}
      variant="editorial"
    />
  </>
)
