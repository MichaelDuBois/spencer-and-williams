'use client'

import { Check, Plus } from 'lucide-react'
import { useCompare } from 'react-instantsearch'

import type { ComparisonCapability } from '@/features/chatWidget/hooks/useComparisonCapability'

interface CompareToggleProps {
  hit: { objectID: string } & Record<string, unknown>
  capability: ComparisonCapability
}

export const CompareToggle = ({ hit, capability }: CompareToggleProps) => {
  const { isSelected, canAddItems, toggleItem } = useCompare(capability)
  const selected = isSelected(hit.objectID)
  const name =
    typeof hit.name === 'string' && hit.name.trim() ? hit.name : hit.objectID
  return (
    <button
      type="button"
      aria-label={`Compare ${name}`}
      aria-pressed={selected}
      disabled={!selected && !canAddItems}
      onClick={() => toggleItem(hit)}
      className="sw-CompareToggle border-border rounded-button bg-background text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-foreground focus-visible:outline-accent inline-flex min-h-7 cursor-pointer items-center gap-1 border px-2 py-1 text-xs leading-none font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
      {selected ? (
        <Check aria-hidden="true" className="h-3 w-3" />
      ) : (
        <Plus aria-hidden="true" className="h-3 w-3" />
      )}
      Compare
    </button>
  )
}
