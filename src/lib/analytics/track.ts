import * as amplitude from '@amplitude/analytics-browser'

import type { ProductRecommendModel } from '@/hooks/useRecommend'
import { isAmplitudeEnabled } from '@/lib/analytics/amplitude'
import type { AlgoliaEnvironment } from '@/stores/algoliaEnvironment'
import type { DemoOptionKey } from '@/stores/demoOptions'
import type { SelectableProfile } from '@/types'
import type { PersonalizationMode } from '@/utilities/getPersonalizationMode'

type AssistantSurface = 'ai_assistant' | 'chat_widget'

interface AssistantEventProperties {
  surface: AssistantSurface
}

interface AssistantMessageSentProperties extends AssistantEventProperties {
  message: string
}

interface AssistantResultClickedProperties extends AssistantEventProperties {
  objectID: string
}

interface AssistantSuggestionClickedProperties extends AssistantEventProperties {
  suggestion: string
}

interface ValueChangeProperties<TValue> {
  from: TValue
  to: TValue
}

interface PersonaSelectedProperties {
  persona: string
  persona_type: NonNullable<SelectableProfile['type']>
}

interface DemoOptionToggledProperties {
  option: DemoOptionKey
  enabled: boolean
}

export type ProductClickSurface =
  | 'product_card'
  | 'autocomplete'
  | 'media_title'
  | 'recommend'
  | AssistantSurface

export interface ProductEventProperties {
  objectID: string
  queryID?: string
}

interface ProductClickedProperties extends ProductEventProperties {
  surface: ProductClickSurface
  model?: ProductRecommendModel
  position?: number
  index?: string
}

export type ContentType =
  | 'article'
  | 'podcast'
  | 'documentation'
  | 'blog'
  | 'resource'

interface ContentClickedProperties extends ProductEventProperties {
  contentType: ContentType
  index: string
  position?: number
}

export type AddToCartSurface =
  | 'pdp'
  | 'product_card'
  | 'assistant'
  | 'assistant_context'
  | 'chat_widget'
  | 'recipe'
  | 'recommend'

interface AddToCartProperties extends ProductEventProperties {
  surface: AddToCartSurface
  model?: ProductRecommendModel
  quantity: number
  price?: number
}

interface CheckoutCompletedProperties {
  item_count: number
  order_value: number
  currency: string
  // Amplitude's revenue property (the one its own Revenue event sets), which
  // feeds the built-in revenue charts.
  $revenue: number
}

// The tracking plan: every manual event and the properties it carries. Demo
// context (vertical, persona, ...) is added to every event by demoContextPlugin.
interface TrackingPlan {
  assistant_opened: AssistantEventProperties
  assistant_message_sent: AssistantMessageSentProperties
  assistant_suggestion_clicked: AssistantSuggestionClickedProperties
  assistant_result_clicked: AssistantResultClickedProperties
  persona_selected: PersonaSelectedProperties
  personalization_mode_changed: ValueChangeProperties<PersonalizationMode>
  demo_option_toggled: DemoOptionToggledProperties
  environment_switched: ValueChangeProperties<AlgoliaEnvironment>
  product_clicked: ProductClickedProperties
  content_clicked: ContentClickedProperties
  add_to_cart: AddToCartProperties
  checkout_completed: CheckoutCompletedProperties
  title_added_to_list: ProductEventProperties
  title_played: ProductEventProperties
}

type TrackingEventName = keyof TrackingPlan

export const track = <TEventName extends TrackingEventName>(
  eventName: TEventName,
  properties: TrackingPlan[TEventName],
): void => {
  if (!isAmplitudeEnabled()) return
  amplitude.track(eventName, properties)
}
