import { ProductListingPage } from '@/app/ecommerce/_components/ProductListingPage'
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
