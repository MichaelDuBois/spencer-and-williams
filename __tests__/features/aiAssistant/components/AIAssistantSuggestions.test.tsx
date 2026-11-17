import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AIAssistantSuggestions } from '@/features/aiAssistant/components/AIAssistantSuggestions'

const questions = [
  'What are your best-selling products right now?',
  'Help me find a gift under $50',
  'Compare your most popular options',
]

describe('AIAssistantSuggestions', () => {
  it('renders every question as a button', () => {
    render(<AIAssistantSuggestions questions={questions} onSelect={vi.fn()} />)

    for (const question of questions) {
      expect(
        screen.getByRole('button', { name: question }),
      ).toBeInTheDocument()
    }
  })

  it('fires onSelect with the clicked question text', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<AIAssistantSuggestions questions={questions} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: questions[1] }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(questions[1])
  })

  it('stacks vertically when stacked is set, grid otherwise', () => {
    const { container, rerender } = render(
      <AIAssistantSuggestions
        questions={questions}
        onSelect={vi.fn()}
        stacked
      />,
    )
    expect(container.firstChild).not.toHaveClass('sm:grid-cols-2')

    rerender(
      <AIAssistantSuggestions questions={questions} onSelect={vi.fn()} />,
    )
    expect(container.firstChild).toHaveClass('sm:grid-cols-2')
  })

  it('renders nothing when there are no questions', () => {
    const { container } = render(
      <AIAssistantSuggestions questions={[]} onSelect={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
