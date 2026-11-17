import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { describe, expect, it } from 'vitest'

import { SeeMoreLikeThisButton } from '@/features/aiAssistant/components/messages/SeeMoreLikeThisButton'
import {
  followUpQueryState,
  isAssistantBusyState,
} from '@/features/aiAssistant/stores/aiAssistant'

import type { ReactNode } from 'react'

const renderWithStore = (ui: ReactNode, store = createStore()) => {
  render(<Provider store={store}>{ui}</Provider>)
  return store
}

const getButton = () =>
  screen.getByRole('button', { name: /see more like this/i })

describe('SeeMoreLikeThisButton', () => {
  it('renders nothing when neither title nor query is provided', () => {
    renderWithStore(<SeeMoreLikeThisButton />)

    expect(
      screen.queryByRole('button', { name: /see more like this/i }),
    ).not.toBeInTheDocument()
  })

  it('anchors the follow-up on the group title when provided', async () => {
    const user = userEvent.setup()
    const store = renderWithStore(
      <SeeMoreLikeThisButton title="Asics Running Shoes" query="running shoes" />,
    )

    await user.click(getButton())

    expect(store.get(followUpQueryState)).toEqual({
      text: 'Show me more like Asics Running Shoes',
      excludeShown: true,
    })
  })

  it('falls back to the query when no title is provided', async () => {
    const user = userEvent.setup()
    const store = renderWithStore(<SeeMoreLikeThisButton query="running shoes" />)

    await user.click(getButton())

    expect(store.get(followUpQueryState)).toEqual({
      text: 'Show me more like running shoes',
      excludeShown: true,
    })
  })

  it('is disabled and does not send while the assistant is busy', async () => {
    const user = userEvent.setup()
    const store = createStore()
    store.set(isAssistantBusyState, true)
    renderWithStore(<SeeMoreLikeThisButton title="Asics Running Shoes" />, store)

    const button = getButton()
    expect(button).toBeDisabled()

    await user.click(button)
    expect(store.get(followUpQueryState)).toBeNull()
  })
})
