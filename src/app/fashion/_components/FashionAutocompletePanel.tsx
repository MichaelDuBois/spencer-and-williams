import type { AutocompletePanelProps } from '@/components/autocomplete/AutocompletePanel'

export const FashionAutocompletePanel = ({
  sections,
}: AutocompletePanelProps) => (
  <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-6 [&>[data-slot=autocomplete-discovery]:not(:has(.ais-AutocompleteIndexItem))]:hidden">
    <div data-slot="autocomplete-discovery" className="min-w-0 space-y-5">
      {sections.recent}
      {sections.suggestions}
      {sections.aiSuggestions}
    </div>
    <div
      data-slot="autocomplete-results"
      className="min-w-0 space-y-5 [[data-slot=autocomplete-discovery]:not(:has(.ais-AutocompleteIndexItem))+&]:col-span-full">
      {sections.products}
      {sections.articles}
    </div>
  </div>
)
