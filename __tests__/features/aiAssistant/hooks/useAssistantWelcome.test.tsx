import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PERSONAS } from '@/app/ecommerce/personas'
import { useAssistantWelcome } from '@/features/aiAssistant/hooks/useAssistantWelcome'
import { productVertical } from '@/features/aiAssistant/verticals/product-vertical'
import { activeConfigAtom } from '@/stores/activeConfig'
import { activePersonaAtom } from '@/stores/personalization'
import type { SelectableProfile } from '@/types'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
} from '../../../helpers/test-utils'


const renderAssistantWelcome = (persona: SelectableProfile | null) => {
  const store = createTestStore((s) => {
    s.set(activeConfigAtom, createMockConfig())
    s.set(activePersonaAtom, persona)
  })

  return renderHook(() => useAssistantWelcome(), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })
}

describe('useAssistantWelcome', () => {
  it("falls back to the vertical's empty state without a persona", () => {
    const { result } = renderAssistantWelcome(null)

    expect(result.current.greetingText).toBe(productVertical.emptyStateText)
    expect(result.current.starterQuestions).toEqual(
      productVertical.suggestedQuestions,
    )
  })

  it('derives the greeting and starter questions from the active persona', () => {
    const { result } = renderAssistantWelcome(PERSONAS[0])

    expect(result.current.greetingText).toMatch(/Welcome back, Sports Fan/i)
    expect(result.current.starterQuestions[0]).toBe(
      `Show me ${PERSONAS[0].affinities.brand[0]}`,
    )
  })

  it('offers the FAQ chip but no order chip with an empty order history', () => {
    const { result } = renderAssistantWelcome(PERSONAS[0])

    expect(result.current.starterQuestions).toContain(
      "What's your return policy?",
    )
    expect(result.current.starterQuestions).not.toContain(
      "Where's my last order?",
    )
  })
})
