interface PrefixLabel {
  prefix: string
  label: string
}

const PREFIX_LABEL_MAP: PrefixLabel[] = [
  { prefix: 'demo_external_source', label: 'SPONSORED external' },
  { prefix: 'promoted', label: 'Promoted' },
  { prefix: 'sponsored', label: 'Sponsored' },
  { prefix: 'new-arrival', label: 'New Arrival' },
  { prefix: 'popular', label: 'Popular' },
  { prefix: 'rating', label: 'Highly Rated' },
  { prefix: 'recommend', label: 'Recommended' },
]

const DEFAULT_COMPOSED_LABEL = 'Promoted'

export const getComposedLabel = (injectedItemKey?: string): string =>
  PREFIX_LABEL_MAP.find(({ prefix }) => injectedItemKey?.startsWith(prefix))
    ?.label ?? DEFAULT_COMPOSED_LABEL
