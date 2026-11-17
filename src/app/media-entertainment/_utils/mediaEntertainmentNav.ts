import { mediaEntertainmentConfig as config } from '@/app/media-entertainment/config'
import type { MediaNavItem } from '@/app/media-entertainment/types'

export const MEDIA_NAV_ITEMS: MediaNavItem[] = config.navItems ?? []

/** Exact match: `/search` and title pages belong to no nav item. */
export const isNavItemActive = (
  item: MediaNavItem,
  pathname: string | null,
): boolean => {
  if (!item.href || !pathname) return false

  return pathname.replace(/\/$/, '') === item.href
}
