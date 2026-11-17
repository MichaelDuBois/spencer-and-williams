import { afterEach, describe, expect, it } from 'vitest'

import { PERSONAS } from '@/app/ecommerce/personas'
import { demoContextPlugin } from '@/lib/analytics/demo-context-plugin'
import {
  demoOptionsStore,
  neuralSearchEnabledAtom,
  resetDemoOptionsAtom,
} from '@/stores/demoOptions'
import {
  personalizationStore,
  resetPersonalizationAtom,
  setPersonaModeAtom,
} from '@/stores/personalization'

import type { Types } from '@amplitude/analytics-browser'

const runProperties = async (event: Types.Event) => {
  const enriched = await demoContextPlugin().execute?.(event)
  return enriched?.event_properties as Record<string, unknown> | undefined
}

describe('demoContextPlugin', () => {
  afterEach(() => {
    personalizationStore.set(resetPersonalizationAtom)
    demoOptionsStore.set(resetDemoOptionsAtom)
    window.history.replaceState(null, '', '/')
  })

  it('is an enrichment plugin', () => {
    expect(demoContextPlugin().type).toBe('enrichment')
  })

  it('adds the current demo context to the event properties', async () => {
    window.history.replaceState(null, '', '/travel/article/x')
    personalizationStore.set(setPersonaModeAtom, PERSONAS[0])
    demoOptionsStore.set(neuralSearchEnabledAtom, false)

    const properties = await runProperties({ event_type: 'click' })

    expect(properties).toMatchObject({
      vertical: 'travel',
      persona: PERSONAS[0].id,
      personalization_mode: 'persona',
    })
    expect(properties?.demo_options_enabled).not.toContain(
      'neural_search',
    )
  })

  it('keeps properties the event already set', async () => {
    window.history.replaceState(null, '', '/grocery')

    const properties = await runProperties({
      event_type: 'custom',
      event_properties: { vertical: 'manual', query: 'milk' },
    })

    expect(properties).toMatchObject({
      vertical: 'manual',
      query: 'milk',
      personalization_mode: 'anonymous',
    })
  })

  it('reads the vertical from the page the event was captured on', async () => {
    window.history.replaceState(null, '', '/grocery')

    const properties = await runProperties({
      event_type: '[Amplitude] Element Clicked',
      event_properties: {
        '[Amplitude] Page URL': 'http://localhost:3000/ecommerce/products',
      },
    })

    expect(properties?.vertical).toBe('ecommerce')
  })

  it.each(['/ecommerce/products', ''])(
    'falls back to the current page when the Page URL is %j',
    async (pageUrl) => {
      window.history.replaceState(null, '', '/grocery')

      const properties = await runProperties({
        event_type: '[Amplitude] Element Clicked',
        event_properties: { '[Amplitude] Page URL': pageUrl },
      })

      expect(properties?.vertical).toBe('grocery')
    },
  )

  it.each(['$identify', '$groupidentify', 'revenue_amount'])(
    'leaves %s events untouched',
    async (eventType) => {
      window.history.replaceState(null, '', '/grocery')

      const enriched = await demoContextPlugin().execute?.({
        event_type: eventType,
      })

      expect(enriched?.event_properties).toBeUndefined()
    },
  )
})
