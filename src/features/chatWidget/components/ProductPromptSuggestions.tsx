'use client'

import { Sparkles } from 'lucide-react'
import { useCallback } from 'react'
import { PromptSuggestions, useChatTrigger } from 'react-instantsearch'

import { useActiveConfig } from '@/hooks/useActiveConfig'

interface ProductPromptSuggestionsProps {
  objectID: string
  productName: string
  brand?: string
  category?: string
}

/** Chat widget agent runs the prompt suggestions configuration; a click hands the prompt to the mounted Chat widget. */
export const ProductPromptSuggestions = ({
  objectID,
  productName,
  brand,
  category,
}: ProductPromptSuggestionsProps) => {
  const config = useActiveConfig()
  const { openChat } = useChatTrigger()
  const getProductContext = useCallback(() => {
    return { product: { objectID, name: productName, brand, category } }
  }, [objectID, productName, brand, category])
  const agentId = config?.features.agentStudio.chatWidgetAgentID
  const configurationId =
    config?.features.agentStudio.chatWidgetPromptSuggestionsConfigurationID?.trim()

  if (!agentId || !configurationId) return null

  return (
    <div className="border-border mt-4 border-t pt-6">
      <PromptSuggestions
        agentId={agentId}
        configurationId={configurationId}
        context={getProductContext}
        headerComponent={PromptSuggestionsHeader}
        classNames={{ root: 'sw-ProductPromptSuggestions' }}
      />
      <button
        type="button"
        onClick={() => openChat({ message: '', referer: 'ai-mode' })}
        className="border-accent/50 hover:border-accent hover:bg-accent/5 rounded-button mt-4 flex w-full cursor-pointer items-center justify-center gap-2 border bg-transparent px-4 py-3 text-sm font-medium transition-colors">
        <Sparkles className="text-accent h-4 w-4" />
        Ask anything about this product
      </button>
    </div>
  )
}

// Module-level so the header keeps a stable component identity across renders.
const PromptSuggestionsHeader = (): React.JSX.Element => (
  <div className="mb-2 flex items-center gap-2">
    <Sparkles className="text-accent h-4 w-4" />
    <span className="text-sm font-medium">AI Suggestions</span>
  </div>
)
