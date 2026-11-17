import { useEffect } from 'react'
import { useClearRefinements, useRefinementList } from 'react-instantsearch'

import { B2B_VISIBILITY_FACET } from '@/app/b2b-warehouse/config'
import {
  B2B_VISIBILITY_ATTRIBUTE,
  CUSTOMER_GROUPS,
} from '@/app/b2b-warehouse/customerGroups'

export const useB2BVisibilityFacet = (groupId: string | null) => {
  const { items, refine } = useRefinementList({
    attribute: B2B_VISIBILITY_ATTRIBUTE,
  })
  const { canRefine, refine: clearVisibility } = useClearRefinements({
    includedAttributes: [B2B_VISIBILITY_ATTRIBUTE],
  })

  useEffect(() => {
    // A persona supplies its own visibility filter, so discard visitor refinements.
    if (groupId && canRefine) clearVisibility()
  }, [groupId, canRefine, clearVisibility])

  const groups = CUSTOMER_GROUPS.map(({ groupId: value, description }) => {
    const item = items.find(
      (candidate) => candidate.value.toLowerCase() === value.toLowerCase(),
    )
    return {
      groupId: value,
      label: B2B_VISIBILITY_FACET.valueLabels[value] ?? value,
      description,
      isSelected: groupId ? value === groupId : (item?.isRefined ?? false),
      refinementValue: item?.value ?? value,
    }
  })

  return { groups, refine }
}
