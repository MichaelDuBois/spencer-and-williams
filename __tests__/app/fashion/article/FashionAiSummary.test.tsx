import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FashionAiSummary } from '@/app/fashion/_components/FashionAiSummary'
import type { FashionArticleHitValues } from '@/app/fashion/hitValues.types'

import { render } from '@tests/helpers/test-utils'

const { useAiSummaryMock, openWithMessageMock } = vi.hoisted(() => {
  return { useAiSummaryMock: vi.fn(), openWithMessageMock: vi.fn() }
})

vi.mock('@/features/aiAssistant/hooks/useAiSummary', () => {
  return { useAiSummary: useAiSummaryMock }
})

vi.mock('@/features/aiAssistant/hooks/ui/useOpenAssistantPanel', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/aiAssistant/hooks/ui/useOpenAssistantPanel')
  >('@/features/aiAssistant/hooks/ui/useOpenAssistantPanel')

  return {
    ...actual,
    useOpenAssistantPanel: () => {
      return { openWithMessage: openWithMessageMock }
    },
  }
})

const STORED_SUMMARY = 'A tonal blue-and-grey outfit.'
const AGENT_SUMMARY = 'This guide showcases a balanced city outfit.'

const article = {
  objectID: 'fashion-article-zip-and-puff-city-kit',
  productUrl: '/fashion/article/fashion-article-zip-and-puff-city-kit',
  title: 'Zip, Puff, Roll: A City Kit for Blue-on-Grey Weekend Wear',
  aiSummary: STORED_SUMMARY,
} as FashionArticleHitValues

const PANEL_OPTIONS = {
  clearHistory: false,
  expanded: false,
  navigate: false,
}

describe('FashionAiSummary', () => {
  beforeEach(() => {
    useAiSummaryMock.mockReset()
    openWithMessageMock.mockReset()
  })

  it('prefers the agent summary over the stored ai_summary', () => {
    useAiSummaryMock.mockReturnValue({
      summary: AGENT_SUMMARY,
      promptSuggestions: [],
      isLoading: false,
    })

    render(<FashionAiSummary article={article} />)

    expect(screen.getByText(AGENT_SUMMARY)).toBeInTheDocument()
    expect(screen.queryByText(STORED_SUMMARY)).not.toBeInTheDocument()
  })

  it('falls back to the stored ai_summary once the agent returns nothing', () => {
    useAiSummaryMock.mockImplementation(
      ({ fallbackSummary }: { fallbackSummary?: string }) => {return {
        summary: fallbackSummary?.trim() ?? '',
        promptSuggestions: [],
        isLoading: false,
      }},
    )

    render(<FashionAiSummary article={article} />)

    expect(screen.getByText(STORED_SUMMARY)).toBeInTheDocument()
  })

  it('shows no summary text while the agent is still loading', () => {
    useAiSummaryMock.mockReturnValue({
      summary: '',
      promptSuggestions: [],
      isLoading: true,
    })

    const { container } = render(<FashionAiSummary article={article} />)

    expect(screen.queryByText(STORED_SUMMARY)).not.toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('opens the assistant with the clicked agent suggestion', () => {
    useAiSummaryMock.mockReturnValue({
      summary: AGENT_SUMMARY,
      promptSuggestions: ['What accessories complement this city outfit?'],
      isLoading: false,
    })

    render(<FashionAiSummary article={article} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'What accessories complement this city outfit?',
      }),
    )

    expect(openWithMessageMock).toHaveBeenCalledWith(
      'What accessories complement this city outfit?',
      PANEL_OPTIONS,
    )
  })

  it('falls back to the built-in suggestions when the agent returns none', () => {
    useAiSummaryMock.mockReturnValue({
      summary: AGENT_SUMMARY,
      promptSuggestions: [],
      isLoading: false,
    })

    render(<FashionAiSummary article={article} />)

    expect(
      screen.getByRole('button', {
        name: 'How would I style this for everyday wear?',
      }),
    ).toBeInTheDocument()
  })

  it('opens the assistant with an empty message from "ask anything"', () => {
    useAiSummaryMock.mockReturnValue({
      summary: AGENT_SUMMARY,
      promptSuggestions: [],
      isLoading: false,
    })

    render(<FashionAiSummary article={article} />)

    fireEvent.click(
      screen.getByRole('button', { name: /Ask anything about this edit/ }),
    )

    expect(openWithMessageMock).toHaveBeenCalledWith('', PANEL_OPTIONS)
  })
})
