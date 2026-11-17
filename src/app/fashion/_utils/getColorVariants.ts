import type { FashionProductHitValues } from '@/app/fashion/hitValues.types'
import type { FashionHitTemplate } from '@/app/fashion/types'
import { colorMap } from '@/components/product/colorMap'
import { buildImageUrl } from '@/utilities/buildImageUrl'
import { getByPath } from '@/utilities/getByPath'

type RawVariant = {
  objectID?: string
  color?: { filter_group?: string; original_name?: string }
  image_urls?: string[]
  price?: number
}

type ColorVariant = NonNullable<
  FashionProductHitValues['colorVariants']
>[number]

const buildHref = (slug: string, objectID: string) =>
  `/${slug}/product/${objectID}`

const parseVariant = (
  variant: RawVariant,
  template: FashionHitTemplate,
  slug: string,
): { filterGroup: string; entry: ColorVariant } | null => {
  const objectID = variant.objectID ?? null
  const filterGroup = variant.color?.filter_group ?? null

  if (!objectID || !filterGroup) return null

  const [, parsedHex] = filterGroup.split(';')
  const name = variant.color?.original_name
  if (!name) return null

  const hex = colorMap[name.toLowerCase()] ?? parsedHex
  if (!hex) return null

  const image = buildImageUrl(variant.image_urls?.[0], {
    prefix: template.imageHrefPrefix,
  })
  if (!image || typeof variant.price !== 'number') return null

  return {
    filterGroup,
    entry: {
      objectID,
      hex,
      name,
      href: buildHref(slug, objectID),
      image,
      price: variant.price,
    },
  }
}

export const getColorVariants = (
  hit: Record<string, unknown>,
  template: FashionHitTemplate,
  slug: string,
): ColorVariant[] | undefined => {
  const rawVariants = getByPath(hit, template.attributes.colorVariants)
  if (!Array.isArray(rawVariants)) return undefined

  const currentObjectID = hit.objectID

  const variantGroups = new Map<string, ColorVariant>()
  for (const raw of rawVariants as RawVariant[]) {
    const parsed = parseVariant(raw, template, slug)
    if (!parsed) continue
    const existing = variantGroups.get(parsed.filterGroup)
    if (!existing) {
      variantGroups.set(parsed.filterGroup, parsed.entry)
      continue
    }
    if (
      existing.objectID !== currentObjectID &&
      parsed.entry.objectID === currentObjectID
    ) {
      variantGroups.set(parsed.filterGroup, parsed.entry)
    }
  }

  if (variantGroups.size < 2) return undefined
  return Array.from(variantGroups.values())
}
