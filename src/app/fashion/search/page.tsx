import { FashionInlineArticleRuleContext } from '@/app/fashion/_components/FashionInlineArticleRuleContext'
import { ProductListingPage } from '@/app/fashion/_components/ProductListingPage'
import { Redirect } from '@/components/results/Redirect'
import { SearchResultsHeader } from '@/components/results/SearchResultsHeader'
import { StoreFilterConfigure } from '@/components/results/StoreFilterConfigure'

const SearchPage = () => (
  <>
    <Redirect />
    <StoreFilterConfigure />
    <FashionInlineArticleRuleContext />
    <ProductListingPage
      header={
        <SearchResultsHeader
          label="Collection"
          showResultCount
          variant="editorial"
        />
      }
    />
  </>
)
export default SearchPage
