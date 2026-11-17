import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { FashionConfigType } from '@/app/fashion/types'
import { useDemoOptions } from '@/components/options/hooks/useDemoOptions'
import { readDemoContext } from '@/lib/analytics/demo-context'
import { activeConfigAtom } from '@/stores/activeConfig'
import {
  chatWidgetEnabledAtom,
  demoOptionsStore,
  neuralSearchEnabledAtom,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'
import type { VerticalConfig } from '@/types'
import { getVerticalDemoFeatures } from '@/verticals/getVerticalDemoFeatures'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import {
  buildProvidersWrapper,
  createMockConfig,
} from '../../../helpers/test-utils'

const { trackMock } = vi.hoisted(() => {
  return { trackMock: vi.fn() }
})
vi.mock('@/lib/analytics/track', () => {
  return { track: trackMock }
})

const pathnameMock = vi.hoisted(() => vi.fn(() => '/ecommerce/search'))

vi.mock('next/navigation', () => {
  return { usePathname: pathnameMock }
})

const optionsFor = (
  features: FashionConfigType['features'],
  configOverrides: Partial<VerticalConfig> = {},
) => {
  const store = createTestStore((s) =>
    s.set(activeConfigAtom, createMockConfig({ ...configOverrides, features })),
  )
  const { result } = renderHook(() => useDemoOptions(), {
    wrapper: buildProvidersWrapper({ store }).Wrapper,
  })
  return result.current
}

const labelsFor = (
  features: FashionConfigType['features'],
  configOverrides: Partial<VerticalConfig> = {},
) => optionsFor(features, configOverrides).map((option) => option.label)

describe('useDemoOptions', () => {
  it('uses the same feature labels as the landing cards', () => {
    const features: VerticalConfig['features'] = {
      agentStudio: {},
      neuralSearch: { enabled: true },
      dynamicReRanking: { enabled: true },
      composition: { multiFeedCompositionId: 'multifeed' },
      intentRouting: { enabled: true },
      distinct: { enabled: true },
    }
    const landingLabels = getVerticalDemoFeatures(
      createMockConfig({ features }),
    )
    expect(
      optionsFor(features)
        .map(({ label }) => label)
        .every((label) => landingLabels.includes(label)),
    ).toBe(true)
  })

  it('does not offer Composition for an empty configuration block', () => {
    expect(
      optionsFor({ agentStudio: {}, composition: {} }).map(
        ({ option }) => option,
      ),
    ).not.toContain('composition')
  })

  it('offers Composition for a multifeed-only configuration', () => {
    expect(
      optionsFor({
        agentStudio: {},
        composition: { multiFeedCompositionId: 'multifeed' },
      }).map(({ option }) => option),
    ).toContain('composition')
  })
  afterEach(() => {
    demoOptionsStore.set(resetDemoOptionsAtom)
  })

  it('offers the Conversational Search toggle when the vertical opts in', () => {
    expect(
      labelsFor({ agentStudio: {}, intentRouting: { enabled: true } }),
    ).toContain('Conversational Search')
  })

  it('omits the toggle when the vertical has no intentRouting block', () => {
    expect(labelsFor({ agentStudio: {} })).not.toContain(
      'Conversational Search',
    )
  })

  it('omits the toggle when the vertical opts out explicitly', () => {
    expect(
      labelsFor({ agentStudio: {}, intentRouting: { enabled: false } }),
    ).not.toContain('Conversational Search')
  })

  it('places the toggle directly after NeuralSearch', () => {
    const labels = labelsFor({
      agentStudio: {},
      neuralSearch: { enabled: true },
      intentRouting: { enabled: true },
    })

    expect(labels.indexOf('Conversational Search')).toBe(
      labels.indexOf('NeuralSearch') + 1,
    )
  })

  describe('Distinct', () => {
    it('offers the Distinct toggle when the vertical opts in', () => {
      expect(
        labelsFor({ agentStudio: {}, distinct: { enabled: true } }),
      ).toContain('Distinct')
    })

    it('omits the toggle when the vertical has no distinct block', () => {
      expect(labelsFor({ agentStudio: {} })).not.toContain('Distinct')
    })

    it('omits the toggle when the vertical opts out explicitly', () => {
      expect(
        labelsFor({ agentStudio: {}, distinct: { enabled: false } }),
      ).not.toContain('Distinct')
    })

    it('defaults to off', () => {
      const distinctOption = optionsFor({
        agentStudio: {},
        distinct: { enabled: true },
      }).find((option) => option.label === 'Distinct')

      expect(distinctOption?.checked).toBe(false)
    })

    it('is enabled when the vertical has no composition', () => {
      const distinctOption = optionsFor({
        agentStudio: {},
        distinct: { enabled: true },
      }).find((option) => option.label === 'Distinct')

      expect(distinctOption?.disabled).toBe(false)
    })

    // Composition is on by default, and the Composition API rejects `distinct`
    // at runtime, so the toggle must read as unavailable rather than inert.
    it('is disabled with an explanatory tooltip while composition is active', () => {
      const distinctOption = optionsFor({
        agentStudio: {},
        composition: { compositionId: 'comp-1' },
        distinct: { enabled: true },
      }).find((option) => option.label === 'Distinct')

      expect(distinctOption?.disabled).toBe(true)
      expect(distinctOption?.checked).toBe(false)
      expect(distinctOption?.disabledTooltip).toBe(
        'Distinct cannot be enabled with Composition API',
      )
    })
  })

  describe('Inline Articles', () => {
    const inlineArticlesOptionFor = (features: FashionConfigType['features']) =>
      optionsFor(features, { slug: 'fashion' }).find(
        (option) => option.label === 'Inline Articles',
      )

    it('offers the toggle when fashion opts in', () => {
      expect(
        labelsFor(
          {
            agentStudio: {},
            composition: { compositionId: 'comp-1' },
            showInlineArticles: true,
          },
          { slug: 'fashion' },
        ),
      ).toContain('Inline Articles')
    })

    it('omits the toggle when fashion does not opt in', () => {
      expect(
        labelsFor(
          { agentStudio: {}, composition: { compositionId: 'comp-1' } },
          { slug: 'fashion' },
        ),
      ).not.toContain('Inline Articles')
    })

    it('omits the fashion-only toggle from another vertical', () => {
      expect(
        labelsFor(
          { agentStudio: {}, showInlineArticles: true },
          {
            slug: 'ecommerce',
          },
        ),
      ).not.toContain('Inline Articles')
    })

    it('defaults to on', () => {
      const option = inlineArticlesOptionFor({
        agentStudio: {},
        showInlineArticles: true,
      })

      expect(option?.checked).toBe(true)
    })

    // The articles index is queried alongside the products, not through the
    // composition, so the toggle stays usable whatever composition is doing.
    it.each([
      ['with a composition configured', { compositionId: 'comp-1' }],
      ['with no composition', undefined],
    ])('is available %s', (_, composition) => {
      const option = inlineArticlesOptionFor({
        agentStudio: {},
        ...(composition && { composition }),
        showInlineArticles: true,
      })

      expect(option?.disabled).toBeUndefined()
      expect(option?.checked).toBe(true)
    })
  })

  describe('InstantSearch Chat Widget', () => {
    it('offers the toggle when the vertical has a chat widget agent', () => {
      expect(
        labelsFor({ agentStudio: { chatWidgetAgentID: 'chat-agent-1' } }),
      ).toContain('InstantSearch Chat Widget')
    })

    it('omits the toggle when the vertical has no chat widget agent', () => {
      expect(labelsFor({ agentStudio: {} })).not.toContain(
        'InstantSearch Chat Widget',
      )
    })

    it('defaults to off so the custom assistant stays in charge', () => {
      const option = optionsFor({
        agentStudio: { chatWidgetAgentID: 'chat-agent-1' },
      }).find((o) => o.label === 'InstantSearch Chat Widget')

      expect(option?.checked).toBe(false)
    })

    // The analytics context reads the pinned store, not the Provider store.
    it('writes the toggle to the pinned demo options store', () => {
      const option = optionsFor({
        agentStudio: { chatWidgetAgentID: 'chat-agent-1' },
      }).find((o) => o.label === 'InstantSearch Chat Widget')

      act(() => option?.onCheckedChange(true))

      expect(demoOptionsStore.get(chatWidgetEnabledAtom)).toBe(true)
      expect(readDemoContext('/ecommerce').demo_options_enabled).toContain(
        'chat_widget',
      )
    })
  })

  describe('analytics', () => {
    beforeEach(() => {
      trackMock.mockClear()
    })

    const neuralSearchOption = () =>
      optionsFor({ agentStudio: {}, neuralSearch: { enabled: true } }).find(
        (o) => o.label === 'NeuralSearch',
      )

    it.each([false, true])(
      'tracks the toggle flipped to %s with its context key',
      (enabled) => {
        const option = neuralSearchOption()

        act(() => option?.onCheckedChange(enabled))

        expect(demoOptionsStore.get(neuralSearchEnabledAtom)).toBe(enabled)
        expect(trackMock).toHaveBeenCalledTimes(1)
        expect(trackMock).toHaveBeenCalledWith('demo_option_toggled', {
          option: 'neural_search',
          enabled,
        })
      },
    )

    it.each([
      ['NeuralSearch', 'neural_search'],
      ['Conversational Search', 'intent_routing'],
      ['Merchandised content with Algolia Composition', 'composition'],
      ['Dynamic Re-Ranking (DRR)', 'dynamic_re_ranking'],
      ['Query Categorization', 'query_categorization'],
      ['Dynamic Facet Ordering', 'dynamic_facet_ordering'],
      ['Distinct', 'distinct'],
      ['Inline Articles', 'inline_articles'],
      ['InstantSearch Chat Widget', 'chat_widget'],
    ])('tracks the %s toggle under %s', (label, option) => {
      const toggle = optionsFor(
        {
          agentStudio: { chatWidgetAgentID: 'chat-agent-1' },
          neuralSearch: { enabled: true },
          intentRouting: { enabled: true },
          composition: { compositionId: 'comp-1' },
          dynamicReRanking: { enabled: true },
          queryCategorization: { enabled: true },
          dynamicFacetOrdering: { enabled: true },
          distinct: { enabled: true },
          showInlineArticles: true,
        },
        { slug: 'fashion' },
      ).find((o) => o.label === label)

      act(() => toggle?.onCheckedChange(true))

      expect(trackMock).toHaveBeenCalledTimes(1)
      expect(trackMock).toHaveBeenCalledWith('demo_option_toggled', {
        option,
        enabled: true,
      })
    })

    it('tracks the chat widget toggle under its context key', () => {
      const option = optionsFor({
        agentStudio: { chatWidgetAgentID: 'chat-agent-1' },
      }).find((o) => o.label === 'InstantSearch Chat Widget')

      act(() => option?.onCheckedChange(true))

      expect(trackMock).toHaveBeenCalledWith('demo_option_toggled', {
        option: 'chat_widget',
        enabled: true,
      })
    })

    it('tracks nothing when the options are reset', () => {
      demoOptionsStore.set(neuralSearchEnabledAtom, false)
      expect(neuralSearchOption()?.checked).toBe(false)

      act(() => demoOptionsStore.set(resetDemoOptionsAtom))

      expect(demoOptionsStore.get(neuralSearchEnabledAtom)).toBe(true)
      expect(trackMock).not.toHaveBeenCalled()
    })
  })
})
