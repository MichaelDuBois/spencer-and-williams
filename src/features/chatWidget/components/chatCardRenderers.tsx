import {
  getB2BContentArticleHitValues,
  getB2BContentBlogHitValues,
  getB2BContentDocumentationHitValues,
  getB2BContentResourceHitValues,
} from '@/app/b2b-content/_utils/getB2BContentHitValues'
import { b2bContentConfig } from '@/app/b2b-content/config'
import { getB2BWarehouseProductHitValues } from '@/app/b2b-warehouse/_utils/getB2BWarehouseProductHitValues'
import { b2bWarehouseConfig } from '@/app/b2b-warehouse/config'
import { getEcommerceProductHitValues } from '@/app/ecommerce/_utils/getEcommerceProductHitValues'
import { ecommerceConfig } from '@/app/ecommerce/config'
import { getElectronicsProductHitValues } from '@/app/electronics/_utils/getElectronicsProductHitValues'
import { electronicsConfig } from '@/app/electronics/config'
import { getFashionArticleHitValues } from '@/app/fashion/_utils/getFashionArticleHitValues'
import { getFashionProductHitValues } from '@/app/fashion/_utils/getFashionProductHitValues'
import { fashionConfig } from '@/app/fashion/config'
import { getFurnishingProductHitValues } from '@/app/furnishing/_utils/getFurnishingProductHitValues'
import { furnishingConfig } from '@/app/furnishing/config'
import { getGroceryProductHitValues } from '@/app/grocery/_utils/getGroceryProductHitValues'
import { getGroceryRecipeHitValues } from '@/app/grocery/_utils/getGroceryRecipeHitValues'
import { groceryConfig } from '@/app/grocery/config'
import { getMediaEntertainmentHitValues } from '@/app/media-entertainment/_utils/getMediaEntertainmentHitValues'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import {
  getActivityHitValues,
  getArticleHitValues,
  getPodcastHitValues,
} from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import type { HitProductValues } from '@/components/hit/hit.types'
import { ArticleCard as B2BArticleCard } from '@/features/aiAssistant/components/messages/b2b-content/ArticleCard'
import { BlogCard } from '@/features/aiAssistant/components/messages/b2b-content/BlogCard'
import { DocumentationCard } from '@/features/aiAssistant/components/messages/b2b-content/DocumentationCard'
import { ResourceCard } from '@/features/aiAssistant/components/messages/b2b-content/ResourceCard'
import { B2BWarehouseProductCard } from '@/features/aiAssistant/components/messages/b2b-warehouse/B2BWarehouseProductCard'
import { EcommerceProductCard } from '@/features/aiAssistant/components/messages/ecommerce/EcommerceProductCard'
import { ElectronicsProductCard } from '@/features/aiAssistant/components/messages/electronics/ElectronicsProductCard'
import { FashionArticleCard } from '@/features/aiAssistant/components/messages/fashion/FashionArticleCard'
import { FashionProductCard } from '@/features/aiAssistant/components/messages/fashion/FashionProductCard'
import { FurnishingProductCard } from '@/features/aiAssistant/components/messages/furnishing/FurnishingProductCard'
import { GroceryProductCard } from '@/features/aiAssistant/components/messages/grocery/GroceryProductCard'
import { GroceryRecipeCard } from '@/features/aiAssistant/components/messages/grocery/GroceryRecipeCard'
import { MediaAssistantTitleCard } from '@/features/aiAssistant/components/messages/media-entertainment/MediaAssistantTitleCard'
import { TravelActivityCard } from '@/features/aiAssistant/components/messages/travel/TravelActivityCard'
import { TravelArticleCard } from '@/features/aiAssistant/components/messages/travel/TravelArticleCard'
import { TravelPodcastCard } from '@/features/aiAssistant/components/messages/travel/TravelPodcastCard'
import { ChatComparisonProductCard } from '@/features/chatWidget/components/ChatComparisonProductCard'
import {
  getB2BContentResultType,
  getFashionResultType,
  getGroceryResultType,
  getTravelResultType,
} from '@/features/chatWidget/utils/resolveChatResultType'
import type { HitExtractor } from '@/types/hitTemplate.types'

interface ChatCardDisplayItem {
  objectID: string
  why: string
}

type ChatCardRenderFn = (
  item: Record<string, unknown>,
  displayItem: ChatCardDisplayItem,
  compact?: boolean,
) => React.ReactNode

type ChatVerticalSlug =
  | 'fashion'
  | 'grocery'
  | 'travel'
  | 'b2b-content'
  | 'ecommerce'
  | 'electronics'
  | 'furnishing'
  | 'b2b-warehouse'
  | 'media-entertainment'

const createTypedRenderer =
  <Type extends string>(
    resolveType: (item: Record<string, unknown>) => Type,
    cards: Record<NoInfer<Type>, ChatCardRenderFn>,
  ): ChatCardRenderFn =>
  (item, displayItem, compact) =>
    cards[resolveType(item)](item, displayItem, compact)

const createCardRenderer =
  <Data, Template>(
    slug: string,
    template: Template | undefined,
    getHitValues: HitExtractor<Data, Template>,
    renderCard: (
      displayItem: ChatCardDisplayItem,
      directData: Data,
    ) => React.ReactNode,
    renderCompactCard?: (directData: Data) => React.ReactNode,
  ): ChatCardRenderFn =>
  (item, displayItem, compact = false) => {
    if (!template) return null
    const directData = getHitValues(item, template, slug)
    return compact && renderCompactCard
      ? renderCompactCard(directData)
      : renderCard(displayItem, directData)
  }

const createContentCardRenderer = <Data, Template, Type extends string>(
  slug: string,
  template: Template | undefined,
  getHitValues: HitExtractor<Data, Template>,
  renderCard: (
    displayItem: ChatCardDisplayItem,
    directData: Data & { type: Type },
  ) => React.ReactNode,
  type: Type,
): ChatCardRenderFn =>
  createCardRenderer(slug, template, getHitValues, (item, data) =>
    renderCard(item, { ...data, type }),
  )

const renderCompactProductCard = (product: HitProductValues) => (
  <ChatComparisonProductCard product={product} />
)

export const CHAT_CARD_RENDERERS = {
  fashion: createTypedRenderer(getFashionResultType, {
    articles: createCardRenderer(
      'fashion',
      fashionConfig.algolia.indices.articles.template,
      getFashionArticleHitValues,
      (displayItem, directData) => (
        <FashionArticleCard item={displayItem} directData={directData} />
      ),
    ),
    products: createCardRenderer(
      'fashion',
      fashionConfig.algolia.primaryIndex.template,
      getFashionProductHitValues,
      (product, directData) => (
        <FashionProductCard product={product} directData={directData} />
      ),
      renderCompactProductCard,
    ),
  }),
  grocery: createTypedRenderer(getGroceryResultType, {
    recipes: createCardRenderer(
      'grocery',
      groceryConfig.algolia.indices.recipes.template,
      getGroceryRecipeHitValues,
      (displayItem, directData) => (
        <GroceryRecipeCard item={displayItem} directData={directData} />
      ),
    ),
    products: createCardRenderer(
      'grocery',
      groceryConfig.algolia.primaryIndex.template,
      getGroceryProductHitValues,
      (product, directData) => (
        <GroceryProductCard product={product} directData={directData} />
      ),
      renderCompactProductCard,
    ),
  }),
  travel: createTypedRenderer(getTravelResultType, {
    podcasts: createContentCardRenderer(
      'travel',
      travelConfig.algolia.indices.podcasts.template,
      getPodcastHitValues,
      (displayItem, directData) => (
        <TravelPodcastCard item={displayItem} directData={directData} />
      ),
      'podcasts',
    ),
    activities: createContentCardRenderer(
      'travel',
      travelConfig.algolia.indices.activities.template,
      getActivityHitValues,
      (displayItem, directData) => (
        <TravelActivityCard item={displayItem} directData={directData} />
      ),
      'activities',
    ),
    articles: createContentCardRenderer(
      'travel',
      travelConfig.algolia.primaryIndex.template,
      getArticleHitValues,
      (displayItem, directData) => (
        <TravelArticleCard item={displayItem} directData={directData} />
      ),
      'articles',
    ),
  }),
  'b2b-content': createTypedRenderer(getB2BContentResultType, {
    blogs: createContentCardRenderer(
      'b2b-content',
      b2bContentConfig.algolia.indices.blogs.template,
      getB2BContentBlogHitValues,
      (displayItem, directData) => (
        <BlogCard item={displayItem} directData={directData} />
      ),
      'blogs',
    ),
    resources: createContentCardRenderer(
      'b2b-content',
      b2bContentConfig.algolia.indices.resources.template,
      getB2BContentResourceHitValues,
      (displayItem, directData) => (
        <ResourceCard item={displayItem} directData={directData} />
      ),
      'resources',
    ),
    articles: createContentCardRenderer(
      'b2b-content',
      b2bContentConfig.algolia.indices.articles.template,
      getB2BContentArticleHitValues,
      (displayItem, directData) => (
        <B2BArticleCard item={displayItem} directData={directData} />
      ),
      'articles',
    ),
    documentation: createContentCardRenderer(
      'b2b-content',
      b2bContentConfig.algolia.primaryIndex.template,
      getB2BContentDocumentationHitValues,
      (displayItem, directData) => (
        <DocumentationCard item={displayItem} directData={directData} />
      ),
      'documentation',
    ),
  }),
  ecommerce: createCardRenderer(
    'ecommerce',
    ecommerceConfig.algolia.primaryIndex.template,
    getEcommerceProductHitValues,
    (product, directData) => (
      <EcommerceProductCard product={product} directData={directData} />
    ),
    renderCompactProductCard,
  ),
  electronics: createCardRenderer(
    'electronics',
    electronicsConfig.algolia.primaryIndex.template,
    getElectronicsProductHitValues,
    (product, directData) => (
      <ElectronicsProductCard product={product} directData={directData} />
    ),
    renderCompactProductCard,
  ),
  furnishing: createCardRenderer(
    'furnishing',
    furnishingConfig.algolia.primaryIndex.template,
    getFurnishingProductHitValues,
    (product, directData) => (
      <FurnishingProductCard product={product} directData={directData} />
    ),
    renderCompactProductCard,
  ),
  'b2b-warehouse': createCardRenderer(
    'b2b-warehouse',
    b2bWarehouseConfig.algolia.primaryIndex.template,
    getB2BWarehouseProductHitValues,
    (product, directData) => (
      <B2BWarehouseProductCard product={product} directData={directData} />
    ),
    renderCompactProductCard,
  ),
  'media-entertainment': createCardRenderer(
    'media-entertainment',
    mediaEntertainmentConfig.algolia.primaryIndex.template,
    getMediaEntertainmentHitValues,
    (item, directData) => (
      <MediaAssistantTitleCard item={item} directData={directData} />
    ),
  ),
} satisfies Record<ChatVerticalSlug, ChatCardRenderFn>

export const getChatCardRenderer = (
  slug: string,
): ChatCardRenderFn | undefined =>
  Object.hasOwn(CHAT_CARD_RENDERERS, slug)
    ? CHAT_CARD_RENDERERS[slug as ChatVerticalSlug]
    : undefined
