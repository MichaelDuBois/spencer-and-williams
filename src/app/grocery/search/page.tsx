import { ProductListingPage } from '@/app/grocery/_components/ProductListingPage'
import { Redirect } from '@/components/results/Redirect'
import { StoreFilterConfigure } from '@/components/results/StoreFilterConfigure'

const SearchPage = () => (
  <>
    <Redirect />
    <StoreFilterConfigure />
    <ProductListingPage title="Products" />
  </>
)

export default SearchPage
