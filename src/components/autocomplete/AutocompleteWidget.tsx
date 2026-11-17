'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Autocomplete } from 'react-instantsearch'
import 'instantsearch.css/themes/satellite.css'

import {
  AutocompletePanel,
  type AutocompleteHitProps,
  type AutocompletePanelProps,
} from '@/components/autocomplete/AutocompletePanel'
import { AutocompleteProvider } from '@/components/autocomplete/AutocompleteProvider'
import { AutocompleteResetBoundary } from '@/components/autocomplete/AutocompleteResetBoundary'
import {
  useAIButtonInjection,
  useAutocompleteIndices,
} from '@/components/autocomplete/hooks'
import { isAIAssistantOpenState } from '@/features/aiAssistant'
import { useIntentRouting } from '@/hooks/useIntentRouting'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSearchParameters } from '@/hooks/useSearchParameters'
import { searchClientAtom } from '@/stores/searchClient'

import type { ComponentType, ReactElement } from 'react'

interface AdditionalAutocompleteIndex {
  indexName: string
  searchParameters?: { hitsPerPage: number }
  classNames?: { list?: string; item?: string }
  headerComponent: () => ReactElement
  itemComponent: (props: AutocompleteHitProps) => ReactElement
  getURL: (item: Record<string, unknown>) => string
}

const DETACHED_MEDIA_QUERY = '(max-width: 1023px)'

interface AutocompleteWidgetProps {
  basePath: string
  placeholder?: string
  showProducts?: boolean
  showSuggestions?: boolean
  showRecent?: boolean
  showAISuggestions?: boolean
  showRecipes?: boolean
  showSku?: boolean
  showAIButton?: boolean
  hitsPerPage?: number
  querySuggestionsHitsPerPage?: number
  panelComponent?: ComponentType<AutocompletePanelProps>
  articlesIndex?: AdditionalAutocompleteIndex
}

export const AutocompleteWidget = ({
  basePath,
  placeholder = 'Search...',
  showProducts = true,
  showSuggestions = false,
  showRecent = false,
  showAISuggestions = false,
  showRecipes = false,
  showSku = false,
  showAIButton = false,
  hitsPerPage = 3,
  querySuggestionsHitsPerPage,
  panelComponent: Panel = AutocompletePanel,
  articlesIndex,
}: AutocompleteWidgetProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const setIsAIAssistantOpen = useSetAtom(isAIAssistantOpenState)
  const searchParameters = useSearchParameters()
  // Set in the keydown capture phase when Enter selects a highlighted hit, read
  // by the submit handler so it doesn't navigate on top of the hit's onSelect.
  const enterSelectedItemRef = useRef(false)
  const { routeIfConversational } = useIntentRouting(basePath)

  const isOnSearchPage = pathname.includes('/search')
  const isDetached = useMediaQuery(DETACHED_MEDIA_QUERY)

  // Routes to the AI assistant panel or the Chat widget depending on
  // `chatWidgetEnabledAtom` — see useAIButtonInjection.
  useAIButtonInjection({
    enabled: showAIButton,
    basePath,
  })

  const {
    indices,
    transformItems,
    suggestionsConfig,
    recentConfig,
    primaryIndexName,
    aiSuggestionsIndexName,
    recipesIndexName,
  } = useAutocompleteIndices({
    basePath,
    hitsPerPage,
    querySuggestionsHitsPerPage: isDetached ? 3 : querySuggestionsHitsPerPage,
    showProducts,
    showSuggestions,
    showAISuggestions,
    showAIButton,
    showRecent,
    showRecipes,
    showSku,
  })

  const handleSelect = (params: {
    item?: Record<string, unknown>
    url?: string
  }) => {
    if (!params.item) return

    const { item, url } = params

    setIsAIAssistantOpen(false)

    // Recent search or query suggestion (no source-defined URL)
    if ('query' in item && item.query) {
      router.push(
        `${basePath}/search?query=${encodeURIComponent(String(item.query))}`,
      )
      return
    }

    // Products, recipes, and any other record source navigate via the URL its
    // source defines (getURL). AI suggestions are handled by their own per-index
    // onSelect, so they never reach this global handler.
    if (url) {
      router.push(url)
      return
    }

    // Fallback for record hits without an explicit source URL.
    if (item.objectID) {
      router.push(`${basePath}/product/${item.objectID}`)
    }
  }

  // Navigate to the SRP when the autocomplete form is submitted. We listen on
  // `document` rather than via the widget's `onSubmit` prop because in detached
  // (mobile) mode the form is rendered in a portal outside the widget root, so a
  // root-level submit handler never fires.
  //
  // Two submission paths need handling separately:
  // - Tapping the submit (loupe) button fires a real `submit` event in any mode.
  // - Pressing Enter in detached mode triggers the library's keydown handler,
  //   which closes the modal and unmounts the form synchronously (React 18
  //   flushes discrete events), so the implicit `submit` event never fires. We
  //   catch it in the capture phase, before the library handler runs.
  useEffect(() => {
    const navigateToSearch = (query: string) => {
      if (routeIfConversational(query)) {
        // The inline form keeps focus after submit, which would leave the
        // autocomplete panel open on top of the assistant.
        document
          .querySelector<HTMLInputElement>('.ais-AutocompleteForm input')
          ?.blur()
        return
      }
      setIsAIAssistantOpen(false)
      router.push(
        query
          ? `${basePath}/search?query=${encodeURIComponent(query)}`
          : `${basePath}/search`,
      )
    }

    const handleSubmit = (event: SubmitEvent) => {
      const form = (event.target as HTMLElement | null)?.closest(
        '.ais-AutocompleteForm',
      )
      if (!form) return

      // When Enter selected a highlighted hit, the widget's own onSelect
      // (per-index for AI suggestions, global handleSelect otherwise) already
      // performed the navigation. Navigating again here would clobber it — e.g.
      // reopening the SRP on top of the just-opened AI assistant. Only navigate
      // when Enter was pressed with no hit highlighted (plain query submit).
      if (enterSelectedItemRef.current) {
        enterSelectedItemRef.current = false
      } else {
        navigateToSearch(form.querySelector('input')?.value ?? '')
      }

      // In detached (mobile) mode the widget doesn't reliably close its overlay
      // on submit when there's no remount, so dismiss it via the Cancel button.
      document
        .querySelector<HTMLElement>('.ais-AutocompleteDetachedCancelButton')
        ?.click()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      const form = (event.target as HTMLElement | null)?.closest(
        '.ais-AutocompleteForm',
      )
      if (!form) return

      // Read this in the capture phase, before the widget's own keydown handler
      // runs `submit()` and clears `aria-activedescendant`. If a hit is
      // highlighted, let that selection's onSelect own the navigation and flag
      // the upcoming `submit` event so `handleSubmit` doesn't navigate on top.
      const input = form.querySelector('input')
      if (input?.getAttribute('aria-activedescendant')) {
        enterSelectedItemRef.current = true
        return
      }
      enterSelectedItemRef.current = false

      // No hit highlighted: only the detached form needs manual navigation here;
      // inline submissions fire `submit` normally and are handled above.
      if (!form.closest('.ais-AutocompleteDetachedContainer')) return
      navigateToSearch(input?.value ?? '')
    }

    document.addEventListener('submit', handleSubmit)
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      document.removeEventListener('submit', handleSubmit)
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [basePath, router, setIsAIAssistantOpen, routeIfConversational])

  const handleClick = () => {
    const input = document.querySelector<HTMLInputElement>(
      '.ais-AutocompleteForm input',
    )
    if (
      input &&
      document.activeElement === input &&
      input.getAttribute('aria-expanded') === 'false'
    ) {
      input.dispatchEvent(new FocusEvent('focus', { bubbles: false }))
    }
  }

  const searchClient = useAtomValue(searchClientAtom)
  if (!searchClient || !primaryIndexName) {
    return null
  }

  return (
    <AutocompleteProvider>
      <AutocompleteResetBoundary>
        <Autocomplete
          key={isOnSearchPage ? 'search' : 'non-search'}
          placeholder={placeholder}
          detachedMediaQuery={DETACHED_MEDIA_QUERY}
          onClick={handleClick}
          indices={articlesIndex ? [...indices, articlesIndex] : indices}
          transformItems={transformItems}
          showQuerySuggestions={suggestionsConfig}
          showRecent={recentConfig}
          searchParameters={{
            hitsPerPage,
            ...searchParameters,
          }}
          onSelect={handleSelect}
          panelComponent={({ elements }) => {
            const sections = {
              recent: showRecent ? elements.recent : undefined,
              suggestions: showSuggestions ? elements.suggestions : undefined,
              products: showProducts ? elements[primaryIndexName] : undefined,
              aiSuggestions:
                showAISuggestions && aiSuggestionsIndexName
                  ? elements[aiSuggestionsIndexName]
                  : undefined,
              recipes:
                showRecipes && recipesIndexName
                  ? elements[recipesIndexName]
                  : undefined,
              articles: articlesIndex
                ? elements[articlesIndex.indexName]
                : undefined,
            }

            return (
              <div className="flex flex-col gap-2 px-1">
                <Panel sections={sections} />
              </div>
            )
          }}
        />
      </AutocompleteResetBoundary>
    </AutocompleteProvider>
  )
}
