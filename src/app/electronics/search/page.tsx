import { ProductListingPage } from '@/app/electronics/_components/ProductListingPage'
import { Redirect } from '@/components/results/Redirect'
import { StoreFilterConfigure } from '@/components/results/StoreFilterConfigure'

const SearchPage = () => (
  <>
    <Redirect />
    <StoreFilterConfigure />
    <ProductListingPage title="Electronics" />
  </>
)

export default SearchPage
