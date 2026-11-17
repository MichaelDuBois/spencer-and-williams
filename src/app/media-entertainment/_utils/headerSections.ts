import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import type { MediaHeaderSectionConfig } from '@/app/media-entertainment/types'

export const HEADER_SECTIONS: MediaHeaderSectionConfig[] = config.headerSections

export const getHeaderSection = (
  id: string | undefined,
): MediaHeaderSectionConfig | undefined =>
  HEADER_SECTIONS.find((section) => section.id === id)

/** The `Configure` params a section narrows its slice of the index with. */
export interface HeaderSectionParams {
  filters?: string
  ruleContexts?: string[]
}

/**
 * Both context kinds are sent: media has no personalization feature, so there is
 * no re-rank for pinning rules to fight. Keys are omitted rather than set to
 * `undefined` so `Configure` never overrides an inherited value with a blank.
 */
export const getHeaderSectionParams = (
  section: MediaHeaderSectionConfig,
): HeaderSectionParams => {
  const ruleContexts = [
    ...(section.filterRuleContexts ?? []),
    ...(section.ruleContexts ?? []),
  ]

  return {
    ...(section.filters ? { filters: section.filters } : {}),
    ...(ruleContexts.length ? { ruleContexts } : {}),
  }
}
