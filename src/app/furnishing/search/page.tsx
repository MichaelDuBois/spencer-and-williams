import { FurnishingProductListingPage } from '@/app/furnishing/_components/FurnishingProductListingPage'
import { Redirect } from '@/components/results/Redirect'
import { StoreFilterConfigure } from '@/components/results/StoreFilterConfigure'

const SearchPage = () => (
  <>
    <Redirect />
    <StoreFilterConfigure />
    <FurnishingProductListingPage title="Products" />
  </>
)

export default SearchPage
