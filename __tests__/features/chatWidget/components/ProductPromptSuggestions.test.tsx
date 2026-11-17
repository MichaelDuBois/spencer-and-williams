import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProductPromptSuggestions } from '@/features/chatWidget/components/ProductPromptSuggestions'
import { activeConfigAtom } from '@/stores/activeConfig'
import type { AgentStudioConfig } from '@/types'

import { createTestStore } from '@tests/helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '@tests/helpers/test-utils'

const { promptSuggestionsProps, openChat } = vi.hoisted(() => {
  return {
    openChat: vi.fn(),
    promptSuggestionsProps: {} as {
      agentId?: string
      configurationId?: string
      context?: () => Record<string, unknown>
      headerComponent?: () => React.ReactNode
    },
  }
})

vi.mock('react-instantsearch', () => {
  return {
    useChatTrigger: () => {return { openChat }},
    PromptSuggestions: (props: {
      agentId?: string
      configurationId?: string
      context?: () => Record<string, unknown>
      headerComponent?: () => React.ReactNode
    }) => {
      Object.assign(promptSuggestionsProps, props)
      return <div data-testid="prompt-suggestions">{props.headerComponent?.()}</div>
    },
  }
})

const renderSuggestions = (agentStudio: Partial<AgentStudioConfig>) => {
  const store = createTestStore((s) => {
    s.set(
      activeConfigAtom,
      createMockConfig({
        slug: 'ecommerce',
        features: { agentStudio },
      }),
    )
  })

  return render(
    <ProductPromptSuggestions
      objectID="pin-123"
      productName="Standing Desk"
      brand="Acme"
      category="Office"
    />,
    { wrapper: buildProvidersWrapper({ store }).Wrapper },
  )
}

describe('ProductPromptSuggestions', () => {
  beforeEach(() => {
    openChat.mockClear()
    for (const key of Object.keys(promptSuggestionsProps)) {
      delete promptSuggestionsProps[
        key as keyof typeof promptSuggestionsProps
      ]
    }
  })

  it('renders nothing when the vertical has no prompt suggestions configuration', () => {
    const { container } = renderSuggestions({
      chatWidgetAgentID: 'chat-agent-1',
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing without a chat widget agent', () => {
    const { container } = renderSuggestions({
      chatWidgetPromptSuggestionsConfigurationID: 'algolia_prompt_suggestions_1',
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('invokes the chat widget agent with the prompt suggestions configuration', () => {
    renderSuggestions({
      chatWidgetAgentID: 'chat-agent-1',
      chatWidgetPromptSuggestionsConfigurationID: '  algolia_prompt_suggestions_1  ',
    })

    expect(promptSuggestionsProps.agentId).toBe('chat-agent-1')
    expect(promptSuggestionsProps.configurationId).toBe(
      'algolia_prompt_suggestions_1',
    )
  })

  it('shows the heading and opens an empty chat for a product question', () => {
    renderSuggestions({
      chatWidgetAgentID: 'chat-agent-1',
      chatWidgetPromptSuggestionsConfigurationID: 'algolia_prompt_suggestions_1',
    })

    expect(screen.getByText('AI Suggestions').parentElement?.querySelector('svg')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ask anything about this product' }))
    expect(openChat).toHaveBeenCalledWith({ message: '', referer: 'ai-mode' })
  })

  it('keeps the context callback and header stable across rerenders', () => {
    const { rerender } = renderSuggestions({
      chatWidgetAgentID: 'chat-agent-1',
      chatWidgetPromptSuggestionsConfigurationID: 'algolia_prompt_suggestions_1',
    })
    const context = promptSuggestionsProps.context
    const header = promptSuggestionsProps.headerComponent

    rerender(
      <ProductPromptSuggestions
        objectID="pin-123"
        productName="Standing Desk"
        brand="Acme"
        category="Office"
      />,
    )

    expect(promptSuggestionsProps.context).toBe(context)
    expect(promptSuggestionsProps.headerComponent).toBe(header)
  })

  it('sends the current product as the suggestion context', () => {
    renderSuggestions({
      chatWidgetAgentID: 'chat-agent-1',
      chatWidgetPromptSuggestionsConfigurationID: 'algolia_prompt_suggestions_1',
    })

    expect(promptSuggestionsProps.context?.()).toEqual({
      product: {
        objectID: 'pin-123',
        name: 'Standing Desk',
        brand: 'Acme',
        category: 'Office',
      },
    })
  })
})
