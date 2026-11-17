import { ProductListingPage } from '@/app/b2b-warehouse/_components/ProductListingPage'
import { Redirect } from '@/components/results/Redirect'

const SearchPage = () => (
  <>
    <Redirect />
    <ProductListingPage title="Products" />
  </>
)

export default SearchPage
