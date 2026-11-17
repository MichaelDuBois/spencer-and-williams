// =============================================================================
// Itinerary display (client-side, agent-composed)
// -----------------------------------------------------------------------------
// Arguments of the `displayItinerary` chat-widget client tool: the agent
// composes a multi-day trip plan and hands it over fully formed; the widget
// renders it as-is (render-only — no client-side search). Activities with a
// `parentID` link to their parent record's page (article or podcast, via the
// shared travel route helper); freeform entries render as plain text.
// =============================================================================

export interface ItineraryActivity {
  /** Algolia objectID of the activity record, when sourced from search. */
  objectID?: string
  /**
   * ObjectID of the activity's parent record — the page activities actually
   * link to (same pattern as TravelActivityCard; there is no /activity route).
   */
  parentID?: string
  name: string
  time?: string
  /**
   * Raw `image` attribute of the activity record. The travel activities
   * template defines no `imageHrefPrefix`, so the raw value is the URL the
   * rest of the app renders (same treatment as TravelActivityCard).
   */
  image?: string
  /** Activity location (e.g. "Kyoto, Japan") shown as muted meta text. */
  location?: string
  description?: string
}

export interface ItineraryDay {
  day: number
  title: string
  activities: ItineraryActivity[]
}

export interface ItineraryData {
  /**
   * Trip destination. Optional because streamed output can be missing it; the
   * renderer falls back to a generic title when absent.
   */
  destination?: string
  title?: string
  durationNights?: number
  days: ItineraryDay[]
  notes?: string
}
