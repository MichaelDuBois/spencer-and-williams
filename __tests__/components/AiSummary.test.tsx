import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AiSummary } from '@/components/AiSummary'

import { render } from '@tests/helpers/test-utils'

describe('AiSummary', () => {
  it('renders suggestion-only agent responses', () => {
    render(
      <AiSummary
        summary=""
        promptSuggestions={['What should I explore next?']}
        fallbackPromptSuggestions={[]}
        isLoading={false}
        askAnythingLabel="Ask anything about this article"
        onSuggestionClick={vi.fn()}
        onAskAnything={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'What should I explore next?' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Ask anything about this article/,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('AI Summary')).not.toBeInTheDocument()
  })

  it('does not render fallback suggestions without summary content', () => {
    const { container } = render(
      <AiSummary
        summary=""
        promptSuggestions={[]}
        fallbackPromptSuggestions={['What should I explore next?']}
        isLoading={false}
        askAnythingLabel="Ask anything about this article"
        onSuggestionClick={vi.fn()}
        onAskAnything={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('uses vertical typography and edge tokens without a raised card', () => {
    render(
      <AiSummary
        summary="A concise editorial summary."
        promptSuggestions={['What should I explore next?']}
        fallbackPromptSuggestions={[]}
        isLoading={false}
        askAnythingLabel="Ask about this article"
        onSuggestionClick={vi.fn()}
        onAskAnything={vi.fn()}
      />,
    )

    const label = screen.getByText('AI Summary')
    const card = label.parentElement
    const summary = screen.getByText('A concise editorial summary.')
    const askAnything = screen.getByRole('button', {
      name: /Ask about this article/,
    })

    expect(card).toHaveClass('rounded-card')
    expect(card).not.toHaveClass('rounded-2xl', 'shadow-xl', 'bg-card/80')
    expect(summary).toHaveClass(
      'text-[length:var(--article-body-font-size)]',
    )
    expect(askAnything).toHaveClass('rounded-button')
    expect(askAnything).not.toHaveClass('rounded-full')
  })
})
