import { b2bContentConfig as config } from '@/app/b2b-content/config'
import type { B2BContentIndexKey } from '@/app/b2b-content/types'

export type B2BContentSearchTabKey = 'all' | B2BContentIndexKey

export const tabHref = (key: B2BContentSearchTabKey) =>
  key === 'all' ? `/${config.slug}/search` : `/${config.slug}/search/${key}`

export const tabLabel = (key: B2BContentSearchTabKey) =>
  key[0].toUpperCase() + key.slice(1)
