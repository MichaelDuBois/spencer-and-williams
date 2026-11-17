import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AutocompleteNoResults } from '@/components/autocomplete/AutocompleteNoResults'

const pushMock = vi.hoisted(() => vi.fn())
const openWithMessageMock = vi.hoisted(() => vi.fn())
const useActiveConfigMock = vi.hoisted(() => vi.fn())
const useInstantSearchMock = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => {
  return {
    useRouter: () => {
      return { push: pushMock }
    },
  }
})
vi.mock('react-instantsearch', () => {
  return {
    useSearchBox: () => {
      return { query: 'red shooes' }
    },
    useInstantSearch: useInstantSearchMock,
  }
})
vi.mock('@/hooks/useActiveConfig', () => {
  return {
    useActiveConfig: useActiveConfigMock,
  }
})
vi.mock('@/features/aiAssistant', () => {
  return {
    useOpenAssistantPanel: () => {
      return { openWithMessage: openWithMessageMock }
    },
  }
})

describe('AutocompleteNoResults', () => {
  beforeEach(() => {
    pushMock.mockReset()
    openWithMessageMock.mockReset()
    useInstantSearchMock.mockReturnValue({
      status: 'idle',
      indexRenderState: {
        autocomplete: {
          indices: [
            { results: { __isArtificial: false, query: 'red shooes' } },
          ],
        },
      },
    })
  })

  it('explains the AI recovery action and sends no-results context', () => {
    useActiveConfigMock.mockReturnValue({
      features: {
        agentStudio: { shoppingAssistantAgentID: 'assistant' },
      },
    })
    render(<AutocompleteNoResults basePath="/shop" showAssistant />)

    expect(screen.getByText('No results for “red shooes”')).toBeInTheDocument()
    expect(
      screen.getByText('Try another phrase or browse all results.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Need help finding it?')).toBeInTheDocument()
    expect(
      screen.getByText('Ask our shopping assistant for a recommendation.'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ask the assistant' }))

    expect(openWithMessageMock).toHaveBeenCalledWith(
      'Help me find red shooes',
      {
        keepQuery: true,
        navigate: false,
        turnContext: {
          searchRecovery:
            '[Search recovery context: The customer searched for "red shooes" and the product search returned zero results. Open empathetically by saying you could not find an exact match for their query, then help them recover. If the query may be misspelled, lead with a likely correction such as "Did you mean …?". Otherwise, recommend concrete relevant alternatives, products, or categories with language such as "You might be interested in …". Do not stop at reporting the failed search.]',
        },
      },
    )
    expect(pushMock).toHaveBeenCalledWith('/shop/search?query=red%20shooes')
  })

  it('omits the AI call to action when no assistant is configured', () => {
    useActiveConfigMock.mockReturnValue({ features: {} })
    render(<AutocompleteNoResults basePath="/shop" />)

    expect(
      screen.queryByRole('button', { name: 'Ask the assistant' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Try another phrase or browse all results.'),
    ).toBeInTheDocument()
  })

  it('closes the detached panel and blurs the input before asking AI', () => {
    useActiveConfigMock.mockReturnValue({
      features: {
        agentStudio: { shoppingAssistantAgentID: 'assistant' },
      },
    })
    const cancelButton = document.createElement('button')
    cancelButton.className = 'ais-AutocompleteDetachedCancelButton'
    const cancelClick = vi.fn()
    cancelButton.addEventListener('click', cancelClick)
    const form = document.createElement('form')
    form.className = 'ais-AutocompleteForm'
    const input = document.createElement('input')
    form.appendChild(input)
    document.body.append(cancelButton, form)
    input.focus()

    render(<AutocompleteNoResults basePath="/shop" showAssistant />)
    fireEvent.click(screen.getByRole('button', { name: 'Ask the assistant' }))

    expect(cancelClick).toHaveBeenCalledOnce()
    expect(document.activeElement).not.toBe(input)
    cancelButton.remove()
    form.remove()
  })

  it('navigates to the full results page from the see-all link', () => {
    useActiveConfigMock.mockReturnValue({ features: {} })
    const cancelButton = document.createElement('button')
    cancelButton.className = 'ais-AutocompleteDetachedCancelButton'
    const cancelClick = vi.fn()
    cancelButton.addEventListener('click', cancelClick)
    document.body.append(cancelButton)
    render(<AutocompleteNoResults basePath="/shop" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'See all results for red shooes' }),
    )

    expect(pushMock).toHaveBeenCalledWith('/shop/search?query=red%20shooes')
    expect(openWithMessageMock).not.toHaveBeenCalled()
    expect(cancelClick).toHaveBeenCalledOnce()
    cancelButton.remove()
  })

  it('does not show the assistant without a configured agent', () => {
    useActiveConfigMock.mockReturnValue({ features: {} })
    render(<AutocompleteNoResults basePath="/shop" showAssistant />)

    expect(
      screen.queryByRole('button', { name: 'Ask the assistant' }),
    ).not.toBeInTheDocument()
  })

  it('stays hidden while replacement results are loading', () => {
    useInstantSearchMock.mockReturnValue({
      status: 'loading',
      indexRenderState: {
        autocomplete: {
          indices: [
            { results: { __isArtificial: false, query: 'red shooes' } },
          ],
        },
      },
    })
    useActiveConfigMock.mockReturnValue({ features: {} })

    render(<AutocompleteNoResults basePath="/shop" />)

    expect(
      screen.queryByTestId('autocomplete-no-results'),
    ).not.toBeInTheDocument()
  })

  it.each([
    [],
    [{ results: undefined }],
    [{ results: { __isArtificial: true, query: 'red shooes' } }],
    [{ results: { __isArtificial: false, query: 'previous query' } }],
  ])(
    'stays hidden without completed results for the active query: %j',
    (...indices) => {
      useInstantSearchMock.mockReturnValue({
        status: 'idle',
        indexRenderState: { autocomplete: { indices } },
      })
      useActiveConfigMock.mockReturnValue({ features: {} })

      render(<AutocompleteNoResults basePath="/shop" />)

      expect(
        screen.queryByTestId('autocomplete-no-results'),
      ).not.toBeInTheDocument()
    },
  )
})
