'use client'

import { useCallback } from 'react'

import { AutocompleteNoResults } from '@/components/autocomplete/AutocompleteNoResults'
import { AutocompleteSectionHeader } from '@/components/autocomplete/AutocompleteSectionHeader'
import {
  AISuggestionsHit,
  RecipeAutocompleteHit,
  SuggestionHit,
} from '@/components/autocomplete/hits'
import { useOpenAssistantPanel } from '@/features/aiAssistant'
import { useActiveConfig } from '@/hooks/useActiveConfig'
import { useProductHitDefinition } from '@/hooks/useProductHitDefinition'
import type { AISuggestionHit } from '@/types'
import type { HitTemplate } from '@/types/hitTemplate.types'

import type { AutocompleteConnectorParams } from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete'

type AutocompleteTemplate = HitTemplate<{ name: string }> & {
  attributes: HitTemplate<{ name: string }>['attributes'] & {
    sku?: string
  }
}
interface UseAutocompleteIndicesParams {
  basePath: string
  hitsPerPage: number
  querySuggestionsHitsPerPage?: number
  showProducts: boolean
  showSuggestions: boolean
  showAISuggestions: boolean
  showAIButton?: boolean
  showRecent: boolean
  showRecipes: boolean
  showSku: boolean
}

export const useAutocompleteIndices = ({
  basePath,
  hitsPerPage,
  querySuggestionsHitsPerPage,
  showProducts,
  showSuggestions,
  showAISuggestions,
  showAIButton = false,
  showRecent,
  showRecipes,
  showSku,
}: UseAutocompleteIndicesParams) => {
  const config = useActiveConfig()
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  const primaryIndex = config?.algolia.primaryIndex
  const primaryIndexName = primaryIndex?.name
  const template = primaryIndex?.template as AutocompleteTemplate | undefined
  const slug = config?.slug
  const { definition, queryOptions } = useProductHitDefinition(slug)
  const isHitValid = queryOptions?.isHitValid

  const productsIndex =
    showProducts && primaryIndexName && template && definition && slug
      ? [
          {
            indexName: primaryIndexName,
            searchParameters: {
              hitsPerPage,
              ...(queryOptions?.filters && { filters: queryOptions.filters }),
              ...(queryOptions?.ruleContexts?.length && {
                ruleContexts: queryOptions.ruleContexts,
              }),
            },
            headerComponent: () => (
              <AutocompleteSectionHeader>Products</AutocompleteSectionHeader>
            ),
            noResultsComponent: () => (
              <AutocompleteNoResults
                basePath={basePath}
                showAssistant={showAIButton}
              />
            ),
            itemComponent: ({
              item,
              onSelect,
            }: {
              item: Record<string, unknown>
              onSelect: () => void
            }) =>
              definition.renderAutocompleteHit({
                item,
                template,
                slug,
                onSelect,
                skuAttribute: showSku ? template.attributes.sku : undefined,
              }),
            getURL: (item: Record<string, unknown>) =>
              `${basePath}/product/${item.objectID}`,
          },
        ]
      : []

  const suggestionsIndex = config?.algolia?.indices?.querySuggestions
  const suggestionsConfig =
    showSuggestions && suggestionsIndex?.name
      ? {
          indexName: suggestionsIndex.name,
          searchParameters:
            querySuggestionsHitsPerPage === undefined
              ? undefined
              : { hitsPerPage: querySuggestionsHitsPerPage },
          headerComponent: () => (
            <AutocompleteSectionHeader>Suggestions</AutocompleteSectionHeader>
          ),
          itemComponent: ({
            item,
            onSelect,
          }: {
            item: { query: string }
            onSelect: () => void
          }) => <SuggestionHit item={item} onSelect={onSelect} />,
          getURL: (item: { query: string }) =>
            `${basePath}/search?query=${encodeURIComponent(item.query)}`,
        }
      : undefined

  const aiSuggestionsIndex = config?.algolia?.indices?.aiSuggestions
  const aiSuggestionsConfig =
    showAISuggestions && aiSuggestionsIndex?.name
      ? {
          indexName: aiSuggestionsIndex.name,
          headerComponent: () => (
            <AutocompleteSectionHeader>
              AI Suggestions
            </AutocompleteSectionHeader>
          ),
          itemComponent: ({
            item,
            onSelect,
          }: {
            item: Record<string, unknown>
            onSelect: () => void
          }) => (
            <AISuggestionsHit
              item={item as unknown as AISuggestionHit}
              basePath={basePath}
              onSelect={onSelect}
            />
          ),
          getURL: () => `${basePath}/search`,
          onSelect: ({ item }: { item: { query: string } }) =>
            openWithMessage(item.query, { expanded: true }),
        }
      : undefined

  const recipesIndex = config?.algolia?.indices?.recipes
  const recipesConfig =
    showRecipes && recipesIndex?.name
      ? {
          indexName: recipesIndex.name,
          searchParameters: { hitsPerPage: 8 },
          headerComponent: () => (
            <AutocompleteSectionHeader>Recipes</AutocompleteSectionHeader>
          ),
          itemComponent: ({
            item,
            onSelect,
          }: {
            item: Record<string, unknown>
            onSelect: () => void
          }) => <RecipeAutocompleteHit item={item} onSelect={onSelect} />,
          getURL: (item: Record<string, unknown>) =>
            `${basePath}/recipe/${item.objectID}`,
          classNames: {
            list: 'scrollbar-slim flex gap-1 overflow-x-auto pb-1',
            item: 'shrink-0',
          },
        }
      : undefined

  const recentConfig = showRecent
    ? {
        headerComponent: () => (
          <AutocompleteSectionHeader>Recent</AutocompleteSectionHeader>
        ),
      }
    : undefined

  const allIndices = [
    ...productsIndex,
    ...(recipesConfig ? [recipesConfig] : []),
    ...(aiSuggestionsConfig ? [aiSuggestionsConfig] : []),
  ]

  const transformItems = useCallback<
    NonNullable<AutocompleteConnectorParams['transformItems']>
  >(
    (results) =>
      results.map((result) =>
        result.indexName === primaryIndexName && isHitValid
          ? {
              ...result,
              hits: result.hits.filter(isHitValid),
            }
          : result,
      ),
    [isHitValid, primaryIndexName],
  )

  return {
    indices: allIndices,
    transformItems,
    suggestionsConfig,
    recentConfig,
    primaryIndexName,
    aiSuggestionsIndexName: aiSuggestionsIndex?.name,
    recipesIndexName: recipesIndex?.name,
  }
}
