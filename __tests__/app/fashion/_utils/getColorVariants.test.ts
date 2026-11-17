import { describe, expect, it } from 'vitest'

import { getColorVariants } from '@/app/fashion/_utils/getColorVariants'
import type { FashionHitTemplate } from '@/app/fashion/types'

const slug = 'fashion'

const template = {
  attributes: { colorVariants: 'variants' },
} as unknown as FashionHitTemplate

// Only fully previewable colourways become swatches, so every fixture variant
// carries an image and a price unless the case under test drops one.
const rawVariant = (
  objectID: string,
  filterGroup: string,
  name: string,
  overrides: Record<string, unknown> = {},
) => {return {
  objectID,
  color: { filter_group: filterGroup, original_name: name },
  image_urls: [`${objectID}-0.jpg`],
  price: 100,
  ...overrides,
}}

describe('getColorVariants', () => {
  it('returns undefined when the hit has no variants array', () => {
    expect(getColorVariants({ objectID: 'C' }, template, slug)).toBeUndefined()
  })

  it('returns undefined when fewer than two unique colors exist', () => {
    const hit = {
      objectID: 'C',
      variants: [rawVariant('C', 'brown;#6c442c', 'mocha')],
    }
    expect(getColorVariants(hit, template, slug)).toBeUndefined()
  })

  it('maps unique variants into swatch entries with hrefs', () => {
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('C', 'brown;#6c442c', 'mocha'),
        rawVariant('V_BLUE', 'blue;#0075BB', 'cobalt'),
      ],
    }
    expect(getColorVariants(hit, template, slug)).toEqual([
      {
        objectID: 'C',
        hex: '#6c442c',
        name: 'mocha',
        href: '/fashion/product/C',
        image: 'C-0.jpg',
        price: 100,
      },
      {
        objectID: 'V_BLUE',
        hex: '#0075BB',
        name: 'cobalt',
        href: '/fashion/product/V_BLUE',
        image: 'V_BLUE-0.jpg',
        price: 100,
      },
    ])
  })

  it('dedupes by filter_group, preferring the variant matching the current hit', () => {
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('V_OTHER', 'brown;#6c442c', 'mocha'),
        rawVariant('C', 'brown;#6c442c', 'mocha'),
        rawVariant('V_BLUE', 'blue;#0075BB', 'cobalt'),
      ],
    }
    const result = getColorVariants(hit, template, slug)
    expect(result?.map((v) => v.objectID)).toEqual(['C', 'V_BLUE'])
  })

  it('falls back to the first occurrence when the current hit is not in the duplicate group', () => {
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('V_FIRST', 'yellow;#fff200', 'butter'),
        rawVariant('V_SECOND', 'yellow;#fff200', 'butter'),
        rawVariant('V_BLUE', 'blue;#0075BB', 'cobalt'),
      ],
    }
    const result = getColorVariants(hit, template, slug)
    expect(result?.map((v) => v.objectID)).toEqual(['V_FIRST', 'V_BLUE'])
  })

  it('prefers the colorMap hex over the parsed filter_group hex when the name is mapped', () => {
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('C', 'brown;#6c442c', 'mocha'),
        rawVariant('V_NAVY', 'blue;#123456', 'navy'),
      ],
    }
    const result = getColorVariants(hit, template, slug)
    expect(result?.find((v) => v.objectID === 'V_NAVY')?.hex).toBe('#000080')
  })

  it('carries the first variant image and its price so a hovered card can swap both', () => {
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('C', 'brown;#6c442c', 'mocha', {
          image_urls: ['mocha-0.jpg', 'mocha-1.jpg'],
          price: 137.5,
        }),
        rawVariant('V_BLUE', 'blue;#0075BB', 'cobalt', {
          image_urls: ['cobalt-0.jpg'],
          price: 131.25,
        }),
      ],
    }

    expect(getColorVariants(hit, template, slug)).toEqual([
      {
        objectID: 'C',
        hex: '#6c442c',
        name: 'mocha',
        href: '/fashion/product/C',
        image: 'mocha-0.jpg',
        price: 137.5,
      },
      {
        objectID: 'V_BLUE',
        hex: '#0075BB',
        name: 'cobalt',
        href: '/fashion/product/V_BLUE',
        image: 'cobalt-0.jpg',
        price: 131.25,
      },
    ])
  })

  it('prefixes variant images with the template imageHrefPrefix', () => {
    const prefixedTemplate = {
      attributes: { colorVariants: 'variants' },
      imageHrefPrefix: 'https://cdn.example.com/',
    } as unknown as FashionHitTemplate
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('C', 'brown;#6c442c', 'mocha', {
          image_urls: ['mocha-0.jpg'],
        }),
        rawVariant('V_BLUE', 'blue;#0075BB', 'cobalt', {
          image_urls: ['cobalt-0.jpg'],
        }),
      ],
    }

    expect(
      getColorVariants(hit, prefixedTemplate, slug)?.map((v) => v.image),
    ).toEqual([
      'https://cdn.example.com/mocha-0.jpg',
      'https://cdn.example.com/cobalt-0.jpg',
    ])
  })

  // A swatch retargets the card's image and price, so a colourway carrying
  // neither would preview the record underneath it instead of itself.
  it('drops variants with no image and variants with no price', () => {
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('C', 'brown;#6c442c', 'mocha'),
        rawVariant('V_NO_IMAGE', 'blue;#0075BB', 'cobalt', { image_urls: [] }),
        rawVariant('V_NO_PRICE', 'red;#ff0000', 'brick', { price: undefined }),
        rawVariant('V_YELLOW', 'yellow;#fff200', 'butter'),
      ],
    }

    const result = getColorVariants(hit, template, slug)
    expect(result?.map((v) => v.objectID)).toEqual(['C', 'V_YELLOW'])
  })

  it('returns undefined when dropping incomplete variants leaves a single colour', () => {
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('C', 'brown;#6c442c', 'mocha'),
        rawVariant('V_BLUE', 'blue;#0075BB', 'cobalt', { image_urls: [] }),
      ],
    }

    expect(getColorVariants(hit, template, slug)).toBeUndefined()
  })

  it('skips variants missing objectID, filter_group, name, or hex', () => {
    const hit = {
      objectID: 'C',
      variants: [
        rawVariant('V_VALID', 'red;#ff0000', 'brick'),
        rawVariant('V_NO_ID', 'pink;#ff00ff', 'rose', { objectID: undefined }),
        rawVariant('V_NOHEX', 'green', 'sage'),
        rawVariant('V_VALID_2', 'blue;#0075BB', 'cobalt'),
      ],
    }
    const result = getColorVariants(hit, template, slug)
    expect(result?.map((v) => v.objectID)).toEqual(['V_VALID', 'V_VALID_2'])
  })
})
