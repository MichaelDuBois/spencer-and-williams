'use client'

import { FashionArticleAutocompleteHit } from '@/app/fashion/_components/FashionArticleAutocompleteHit'
import { FashionAutocompletePanel } from '@/app/fashion/_components/FashionAutocompletePanel'
import { AutocompleteSectionHeader } from '@/components/autocomplete/AutocompleteSectionHeader'
import { AutocompleteWidget } from '@/components/autocomplete/AutocompleteWidget'
import { useActiveConfig } from '@/hooks/useActiveConfig'

interface FashionAutocompleteProps {
  basePath: string
}

export const FashionAutocomplete = ({ basePath }: FashionAutocompleteProps) => {
  const config = useActiveConfig()
  const articlesIndexName = config?.algolia.indices?.articles?.name

  return (
    <AutocompleteWidget
      basePath={basePath}
      placeholder="Find your next look..."
      showSuggestions
      querySuggestionsHitsPerPage={5}
      showAISuggestions
      showAIButton
      panelComponent={FashionAutocompletePanel}
      articlesIndex={
        articlesIndexName
          ? {
              indexName: articlesIndexName,
              searchParameters: { hitsPerPage: 8 },
              classNames: {
                list: 'scrollbar-slim flex gap-1 overflow-x-auto pb-1',
                item: 'shrink-0',
              },
              headerComponent: () => (
                <AutocompleteSectionHeader>Guides</AutocompleteSectionHeader>
              ),
              itemComponent: FashionArticleAutocompleteHit,
              getURL: (item) =>
                `${basePath}/article/${encodeURIComponent(String(item.objectID))}`,
            }
          : undefined
      }
    />
  )
}
