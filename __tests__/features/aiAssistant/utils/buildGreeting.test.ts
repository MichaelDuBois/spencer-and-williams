import { describe, expect, it } from 'vitest'

import {
  buildGreetingText,
  buildStarterQuestions,
} from '@/features/aiAssistant/utils/buildGreeting'
import type { OrderHistoryEntry } from '@/stores/orderHistory'
import type { Persona } from '@/types'

import { GROUP_0 } from '@tests/helpers/customerGroups'

const persona: Persona = {
  id: 'sports-fan',
  label: 'Sports Fan',
  description: 'Into sportswear & outdoor gear',
  token: 'persona-sports-fan',
  affinities: {
    brand: ['Nike', 'adidas'],
    'hierarchicalCategories.level1': ['Sports & Outdoors'],
  },
  optionalFilters: [],
}

// Category affinity listed before brand to prove brand-first ordering, and a
// hierarchical path to prove leaf formatting.
const hierarchicalPersona: Persona = {
  ...persona,
  affinities: {
    'hierarchicalCategories.level3': [
      'Clothing, Shoes & Jewelry > Men > Shoes > Athletic',
    ],
    brand: ['Nike'],
  },
}

const latestOrder: OrderHistoryEntry = {
  id: 'SW-ABC123-DEF456',
  items: [{ objectID: '1', name: 'Running Shoes', quantity: 1, price: 80 }],
  subtotal: 80,
  shipping: 0,
  total: 80,
  createdAt: Date.now(),
}

const FALLBACK_TEXT = 'Ask me anything about our products!'
const FALLBACK_QUESTIONS = ['Find a gift under $50', 'Show me running shoes']

describe('buildGreetingText', () => {
  it('uses fallback greeting and starters for a group without affinity fields', () => {
    expect(
      buildGreetingText({
        mode: 'customerGroup',
        persona: GROUP_0,
        latestOrder: null,
        fallback: FALLBACK_TEXT,
      }),
    ).toBe(FALLBACK_TEXT)
    expect(
      buildStarterQuestions({
        mode: 'customerGroup',
        persona: GROUP_0,
        hasOrders: false,
        fallback: FALLBACK_QUESTIONS,
      }),
    ).toEqual(FALLBACK_QUESTIONS)
  })
  it('produces a personalized, preference-aware line for a persona', () => {
    const result = buildGreetingText({
      mode: 'persona',
      persona,
      latestOrder,
      fallback: FALLBACK_TEXT,
    })

    expect(result).toContain('Sports Fan')
    expect(result).toContain('Nike')
    expect(result).toContain('recent order')
  })

  it('prefers a brand affinity for the top-affinity clause', () => {
    const result = buildGreetingText({
      mode: 'persona',
      persona: hierarchicalPersona,
      latestOrder: null,
      fallback: FALLBACK_TEXT,
    })

    // Brand is chosen over the (earlier-listed) category path.
    expect(result).toContain('find Nike')
    expect(result).not.toContain('>')
  })

  it('omits the order clause when there is no latest order', () => {
    const result = buildGreetingText({
      mode: 'persona',
      persona,
      latestOrder: null,
      fallback: FALLBACK_TEXT,
    })

    expect(result).toContain('Sports Fan')
    expect(result).not.toContain('recent order')
  })

  it('returns the fallback unchanged for anonymous shoppers', () => {
    expect(
      buildGreetingText({
        mode: 'anonymous',
        persona,
        latestOrder,
        fallback: FALLBACK_TEXT,
      }),
    ).toBe(FALLBACK_TEXT)
  })

  it('returns the fallback unchanged for realtime shoppers', () => {
    expect(
      buildGreetingText({
        mode: 'realtime',
        persona,
        latestOrder,
        fallback: FALLBACK_TEXT,
      }),
    ).toBe(FALLBACK_TEXT)
  })

  it('personalizes only the greeting line for curated content verticals', () => {
    const contentFallback = 'Ask me anything about travel!'
    const result = buildGreetingText({
      mode: 'persona',
      persona,
      latestOrder,
      fallback: contentFallback,
      starters: 'curated',
    })

    expect(result).toBe(`Welcome back, ${persona.label} 👋 ${contentFallback}`)
    expect(result).toContain('Sports Fan')
    expect(result).toContain(contentFallback)
    // No affinity clause and no hierarchical leaf leakage.
    expect(result).not.toContain('find ')
    expect(result).not.toContain('>')
  })

  it('returns the fallback unchanged for curated anonymous shoppers', () => {
    expect(
      buildGreetingText({
        mode: 'anonymous',
        persona,
        latestOrder,
        fallback: FALLBACK_TEXT,
        starters: 'curated',
      }),
    ).toBe(FALLBACK_TEXT)
  })
})

describe('buildStarterQuestions', () => {
  it('derives chips from affinities and appends a FAQ question', () => {
    const result = buildStarterQuestions({
      mode: 'persona',
      persona,
      hasOrders: false,
      fallback: FALLBACK_QUESTIONS,
    })

    expect(result.some((q) => q.includes('Nike'))).toBe(true)
    expect(result).toContain("What's your return policy?")
    expect(result).not.toContain("Where's my last order?")
    expect(result.length).toBeLessThanOrEqual(4)
  })

  it('renders a hierarchical affinity as its leaf and puts the brand chip first', () => {
    const result = buildStarterQuestions({
      mode: 'persona',
      persona: hierarchicalPersona,
      hasOrders: false,
      fallback: FALLBACK_QUESTIONS,
    })

    // Brand chip comes before the category chip.
    expect(result[0]).toBe('Show me Nike')
    // Hierarchical path is reduced to its trimmed leaf segment.
    expect(result).toContain('Show me Athletic')
    expect(result.some((q) => q.includes('>'))).toBe(false)
  })

  it('includes the order question only when hasOrders is true', () => {
    const result = buildStarterQuestions({
      mode: 'persona',
      persona,
      hasOrders: true,
      fallback: FALLBACK_QUESTIONS,
    })

    expect(result).toContain("Where's my last order?")
    expect(result).toContain("What's your return policy?")
  })

  it('caps at 4 questions', () => {
    const richPersona: Persona = {
      ...persona,
      affinities: {
        brand: ['Nike', 'adidas', 'Puma', 'Reebok', 'Asics'],
      },
    }

    const result = buildStarterQuestions({
      mode: 'persona',
      persona: richPersona,
      hasOrders: true,
      fallback: FALLBACK_QUESTIONS,
    })

    expect(result).toHaveLength(4)
  })

  it('returns the fallback questions for anonymous shoppers', () => {
    expect(
      buildStarterQuestions({
        mode: 'anonymous',
        persona,
        hasOrders: true,
        fallback: FALLBACK_QUESTIONS,
      }),
    ).toBe(FALLBACK_QUESTIONS)
  })

  it('keeps the curated questions unchanged even in persona mode', () => {
    const result = buildStarterQuestions({
      mode: 'persona',
      persona,
      hasOrders: true,
      fallback: FALLBACK_QUESTIONS,
      starters: 'curated',
    })

    // Curated list returned as-is: no auto-derived affinity chips are injected
    // and no order/return-policy chips are appended.
    expect(result).toBe(FALLBACK_QUESTIONS)
    expect(result).not.toContain("What's your return policy?")
    expect(result).not.toContain("Where's my last order?")
  })

  it('prefers a curated persona’s own prompts in persona mode', () => {
    const result = buildStarterQuestions({
      mode: 'persona',
      persona: {
        ...persona,
        assistantPrompts: [
          'Prompt one',
          'Prompt two',
          'Prompt three',
          'Prompt four',
          'Prompt five',
        ],
      },
      hasOrders: true,
      fallback: FALLBACK_QUESTIONS,
      starters: 'curated',
    })

    expect(result).toEqual([
      'Prompt one',
      'Prompt two',
      'Prompt three',
      'Prompt four',
    ])
  })

  it('falls back to the curated questions for an anonymous viewer', () => {
    expect(
      buildStarterQuestions({
        mode: 'anonymous',
        persona: { ...persona, assistantPrompts: ['Prompt one'] },
        hasOrders: false,
        fallback: FALLBACK_QUESTIONS,
        starters: 'curated',
      }),
    ).toBe(FALLBACK_QUESTIONS)
  })
})
