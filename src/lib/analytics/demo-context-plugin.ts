import { Types } from '@amplitude/analytics-browser'

import { readDemoContext } from '@/lib/analytics/demo-context'

const PAGE_URL_PROPERTY = '[Amplitude] Page URL'

// The same events Amplitude's own page URL enrichment leaves untouched.
const EXCLUDED_EVENT_TYPES = new Set<string>([
  Types.SpecialEventType.IDENTIFY,
  Types.SpecialEventType.GROUP_IDENTIFY,
  Types.SpecialEventType.REVENUE,
])

// Events are processed asynchronously: a click that triggers a navigation may
// run after the URL changed, so prefer the page the SDK captured it on.
const getEventPathname = (event: Types.Event): string | undefined => {
  const properties = event.event_properties
  if (!properties || !(PAGE_URL_PROPERTY in properties)) return undefined

  const pageUrl: unknown = properties[PAGE_URL_PROPERTY]
  // The SDK doesn't catch enrichment errors: a throw here would stall every
  // later event.
  return typeof pageUrl === 'string' && URL.canParse(pageUrl)
    ? new URL(pageUrl).pathname
    : undefined
}

export const demoContextPlugin = (): Types.EnrichmentPlugin => {
  return {
    name: 'demo-context',
    type: 'enrichment',
    execute: async (event) => {
      if (EXCLUDED_EVENT_TYPES.has(event.event_type)) return event

      event.event_properties = {
        ...readDemoContext(getEventPathname(event)),
        ...event.event_properties,
      }
      return event
    },
  }
}
