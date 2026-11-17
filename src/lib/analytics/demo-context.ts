import {
  algoliaEnvironmentAtom,
  algoliaEnvironmentStore,
  type AlgoliaEnvironment,
} from '@/stores/algoliaEnvironment'
import {
  DEMO_OPTION_ATOMS,
  DEMO_OPTION_KEYS,
  demoOptionsStore,
  type DemoOptionKey,
} from '@/stores/demoOptions'
import {
  activePersonaAtom,
  personalizationStore,
  realtimePersoEnabledAtom,
} from '@/stores/personalization'
import type { SelectableProfile } from '@/types'
import {
  getPersonalizationMode,
  type PersonalizationMode,
} from '@/utilities/getPersonalizationMode'

// Mirrors the registry in `src/verticals` without bundling every vertical
// config into the pre-hydration script. A test keeps the two in sync.
export const VERTICAL_SLUGS = [
  'ecommerce',
  'fashion',
  'electronics',
  'furnishing',
  'grocery',
  'b2b-warehouse',
  'travel',
  'b2b-content',
  'media-entertainment',
] as const

type VerticalSlug = (typeof VERTICAL_SLUGS)[number]

export interface DemoContextInput {
  pathname: string
  persona: SelectableProfile | null
  realtimeEnabled: boolean
  demoOptions: Record<DemoOptionKey, boolean>
  environment: AlgoliaEnvironment
}

interface DemoContext {
  vertical: VerticalSlug | null
  persona: string | null
  personalization_mode: PersonalizationMode
  demo_options_enabled: DemoOptionKey[]
  algolia_environment: AlgoliaEnvironment
}

export const getVerticalFromPathname = (
  pathname: string,
): VerticalSlug | null => {
  const [segment] = pathname.split('/').filter(Boolean)
  return VERTICAL_SLUGS.find((slug) => slug === segment) ?? null
}

export const getDemoContext = ({
  pathname,
  persona,
  realtimeEnabled,
  demoOptions,
  environment,
}: DemoContextInput): DemoContext => {
  return {
    vertical: getVerticalFromPathname(pathname),
    persona: persona?.id ?? null,
    personalization_mode: getPersonalizationMode({ persona, realtimeEnabled }),
    demo_options_enabled: DEMO_OPTION_KEYS.filter((key) => demoOptions[key]),
    algolia_environment: environment,
  }
}

export const readDemoContext = (
  pathname: string = window.location.pathname,
): DemoContext => {
  const demoOptions = Object.fromEntries(
    DEMO_OPTION_KEYS.map((key) => [
      key,
      demoOptionsStore.get(DEMO_OPTION_ATOMS[key]),
    ]),
  ) as Record<DemoOptionKey, boolean>

  return getDemoContext({
    pathname,
    persona: personalizationStore.get(activePersonaAtom),
    realtimeEnabled: personalizationStore.get(realtimePersoEnabledAtom),
    demoOptions,
    environment: algoliaEnvironmentStore.get(algoliaEnvironmentAtom),
  })
}

export const readPersonalizationMode = (): PersonalizationMode =>
  getPersonalizationMode({
    persona: personalizationStore.get(activePersonaAtom),
    realtimeEnabled: personalizationStore.get(realtimePersoEnabledAtom),
  })
