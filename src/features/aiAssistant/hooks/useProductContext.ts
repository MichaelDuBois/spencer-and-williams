'use client'

import { useAtomValue } from 'jotai'

import {
  useAssistantCatalog,
  type AssistantCatalog,
} from '@/features/aiAssistant/AssistantCatalogContext'
import { productContextState } from '@/features/aiAssistant/stores/aiAssistant'

/**
 * The product the user is currently viewing. A vertical that supplies an
 * assistant catalog owns the value; everywhere else it comes from the page atom.
 */
export const useProductContext = (): AssistantCatalog['productContext'] => {
  const catalog = useAssistantCatalog()
  const pageProduct = useAtomValue(productContextState)

  return catalog ? catalog.productContext : pageProduct
}
