import type { ReactNode } from 'react'

export interface AutocompleteHitProps {
  item: Record<string, unknown>
  onSelect: () => void
}

export interface AutocompletePanelSections {
  recent?: ReactNode
  suggestions?: ReactNode
  products?: ReactNode
  aiSuggestions?: ReactNode
  recipes?: ReactNode
  articles?: ReactNode
}

export interface AutocompletePanelProps {
  sections: AutocompletePanelSections
}

export const AutocompletePanel = ({ sections }: AutocompletePanelProps) => (
  <>
    {sections.recent}
    {sections.suggestions}
    {sections.products}
    {sections.recipes}
    {sections.articles}
    {sections.aiSuggestions}
  </>
)
