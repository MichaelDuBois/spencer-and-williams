import {
  HeartPulse,
  Landmark,
  Package,
  Ship,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react'

import type { ExternalLink } from '@/types'

export interface AemDemo extends ExternalLink {
  description: string
  icon: LucideIcon
  accentColor: string
  features: readonly string[]
}

export const AEM_DEMOS_HEADING = 'Adobe Experience Manager'
export const AEM_DEMOS_OWNERSHIP =
  'Owned and maintained by the AEM team, not Demo Engineering.'

export const AEM_DEMOS: readonly AemDemo[] = [
  {
    name: 'SW Cruises',
    href: 'https://sw-cruises.algolia.com/',
    description:
      'Browse cruise itineraries and articles indexed by the Algolia/AEM Connector, with personalized Browse components and federated global search.',
    icon: Ship,
    features: [
      'Content indexing with the Algolia/AEM Connector',
      'Personalized homepage built from Algolia Browse components',
      'Federated Autocomplete with Query Suggestions and recent searches',
      'Itineraries InstantSearch with facets generated from page tags',
      'Articles personalized by user affinities',
      'Search page with Tab or Stack layouts',
    ],
    accentColor: 'var(--theme-accent-aem-cruises)',
  },
  {
    name: 'SW Finance',
    href: 'https://sw-financial.algolia.com/',
    description:
      'Explore financial products, promotions, and articles on a homepage rendered entirely with Algolia components and AI Personalization in AEM.',
    icon: Landmark,
    features: [
      'Content indexing with the Algolia/AEM Connector',
      'Homepage rendered with Algolia components',
      'AI Personalization per section based on user behavior',
      'Products and Articles Browse pages with page-tag facets',
      'FAQs reordered by user affinities',
      'Search page with tabs per index',
    ],
    accentColor: 'var(--theme-accent-aem-finance)',
  },
  {
    name: 'SW CPG',
    href: 'https://sw-cpg.algolia.com/',
    description:
      'Shop a personalized mix of recipes and products built with Adobe Edge Delivery Services, Document Asset, and Algolia search and agents.',
    icon: Package,
    features: [
      'Adobe Edge Delivery Services and Adobe Document Asset',
      'Personalized recipe and product mix with Browse components',
      'Federated Autocomplete global search',
      'Product results and search page with InstantSearch',
      'Chat icon to start an Algolia Agent',
    ],
    accentColor: 'var(--theme-accent-aem-cpg)',
  },
  {
    name: 'SW Healthcare',
    href: 'https://sw-healthcare.algolia.com/',
    description:
      'Find healthcare products, articles, and FAQs with search as you type and AI Personalization powered by Algolia components in AEM.',
    icon: HeartPulse,
    features: [
      'Content indexing with the Algolia/AEM Connector',
      'Homepage built with Algolia components and AI Personalization',
      'Search as you type in the global navigation',
      'Products, Articles, and FAQs Browse pages with facets',
      'FAQs reordered by user affinities',
      'Search page with InstantSearch',
    ],
    accentColor: 'var(--theme-accent-aem-healthcare)',
  },
  {
    name: 'SW Groceries',
    href: 'https://sw-groceries.algolia.com/',
    description:
      'Shop groceries on a storefront built with Adobe Edge Delivery Services, AEM Universal Editor, and Adobe Commerce, searchable with Algolia.',
    icon: ShoppingBasket,
    features: [
      'Adobe Edge Delivery Services',
      'AEM Universal Editor',
      'Adobe Commerce (SaaS)',
      'Products search page',
    ],
    accentColor: 'var(--theme-accent-aem-groceries)',
  },
]
