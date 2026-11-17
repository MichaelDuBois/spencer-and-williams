import { ListChecks } from 'lucide-react'
import Link from 'next/link'

import { GroceryAutocomplete } from '@/app/grocery/_components/GroceryAutocomplete'
import { groceryConfig as config } from '@/app/grocery/config'
import { CategoryNav } from '@/components/header/CategoryNav'
import { Header } from '@/components/header/Header'
import { DemoOptions } from '@/components/options/DemoOptions'
import { PersonaSwitcher } from '@/components/PersonaSwitcher'
import { StoreLocatorHeaderButton } from '@/components/storeLocator/StoreLocatorHeaderButton'
import { CartBadge } from '@/components/ui/CartBadge'

const basePath = `/${config.slug}`

export const GroceryHeader = () => (
  <>
    <Header variant="standard" logo={config.assets.logo} basePath={basePath}>
      <Header.CenterSection>
        <GroceryAutocomplete basePath={basePath} />
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
      endSlot={
        <Link
          href={`${basePath}/list`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
          aria-label="Grocery list">
          <ListChecks className="h-5 w-5" />
          <span className="hidden lg:inline">Grocery List</span>
        </Link>
      }
    />
  </>
)
