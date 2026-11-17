'use client'

import { B2BProductPrice } from '@/app/b2b-warehouse/_components/B2BProductPrice'
import { useB2BAssistantCatalog } from '@/app/b2b-warehouse/_hooks/useB2BAssistantCatalog'
import { AssistantCatalogContext } from '@/features/aiAssistant/AssistantCatalogContext'
import { AIAssistantLayout } from '@/features/aiAssistant/components/AIAssistantLayout'

export const B2BWarehouseAssistantLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const catalog = useB2BAssistantCatalog()
  return (
    <AssistantCatalogContext.Provider
      value={{ ...catalog, priceComponent: B2BProductPrice }}>
      <AIAssistantLayout basePath="/b2b-warehouse">
        {children}
      </AIAssistantLayout>
    </AssistantCatalogContext.Provider>
  )
}
