'use client'

import { useEffect, useRef } from 'react'
import { CompareBar, useCompare } from 'react-instantsearch'

import { useComparisonCapability } from '@/features/chatWidget/hooks/useComparisonCapability'
import type { ComparisonCapability } from '@/features/chatWidget/hooks/useComparisonCapability'

const ActiveCompareBar = ({
  capability,
}: {
  capability: ComparisonCapability
}) => {
  const { clearItems } = useCompare(capability)
  const clearItemsRef = useRef(clearItems)
  useEffect(() => {
    clearItemsRef.current = clearItems
  }, [clearItems])

  useEffect(() => () => clearItemsRef.current(), [])

  return <CompareBar {...capability} classNames={{ root: 'sw-CompareBar' }} />
}

export const ChatCompareBar = () => {
  const capability = useComparisonCapability()
  return capability ? (
    <ActiveCompareBar
      key={capability.configurationId}
      capability={capability}
    />
  ) : null
}
