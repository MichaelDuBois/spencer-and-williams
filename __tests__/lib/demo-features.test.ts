import { describe, expect, it } from 'vitest'

import { ecommerceConfig } from '@/app/ecommerce/config'
import { DEMO_FEATURES } from '@/lib/demo-features'
import { isFilterSuggestionsEnabled } from '@/stores/demoOptions'
import type { VerticalConfig } from '@/types'
import { getVerticalDemoFeatures } from '@/verticals/getVerticalDemoFeatures'

const configWith = (features: VerticalConfig['features']): VerticalConfig => {return {
  ...ecommerceConfig,
  features,
}}

describe('demo features', () => {
  it.each([
    [{}, false],
    [{ compositionId: '' }, false],
    [{ compositionId: 'primary' }, true],
    [{ multiFeedCompositionId: 'multifeed' }, true],
  ])(
    'detects composition availability from configured identifiers: %j',
    (composition, expected) => {
      expect(
        DEMO_FEATURES.composition.isEnabled(
          configWith({ agentStudio: {}, composition }),
        ),
      ).toBe(expected)
    },
  )

  it('lists configured summary, question suggestions, and distinct capabilities', () => {
    const features = getVerticalDemoFeatures(
      configWith({
        agentStudio: {
          summaryAgentID: 'summary',
          questionSuggestionsAgentID: 'questions',
        },
        distinct: { enabled: true },
      }),
    )
    expect(features).toEqual(['AI Summary', 'Question Suggestions', 'Distinct'])
  })

  it('respects the shared Filter Suggestions gate and requires an agent', () => {
    expect(
      DEMO_FEATURES.filter_suggestions.isEnabled(
        configWith({ agentStudio: {} }),
      ),
    ).toBe(false)
    expect(
      DEMO_FEATURES.filter_suggestions.isEnabled(
        configWith({ agentStudio: { filterSuggestionsAgentID: 'filters' } }),
      ),
    ).toBe(isFilterSuggestionsEnabled)
  })
})
