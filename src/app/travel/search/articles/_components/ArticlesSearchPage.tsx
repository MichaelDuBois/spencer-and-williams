'use client'

import { FileText } from 'lucide-react'
import { Configure } from 'react-instantsearch'

import { travelConfig } from '@/app/travel/config'
import { TravelArticleHit } from '@/app/travel/search/_components/TravelArticleHit'
import { TravelSearchListingPage } from '@/app/travel/search/_components/TravelSearchListingPage'

const { algolia } = travelConfig
const articleIndex = algolia.primaryIndex

export const ArticlesSearchPage = () => (
  <>
    <Configure hitsPerPage={10} />
    <TravelSearchListingPage
      title="Articles"
      icon={<FileText className="text-accent h-5 w-5" />}
      entityName="articles"
      facets={articleIndex.facets ?? []}
      hitComponent={(hit) =>
        articleIndex.template ? (
          <TravelArticleHit hit={hit} template={articleIndex.template} />
        ) : null
      }
      hitsClassNames={{ list: 'flex flex-col', item: '' }}
    />
  </>
)
