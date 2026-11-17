import { describe, expect, it } from 'vitest'

import type { ContentDataBlock } from '@/types/recordHit.types'
import { groupContentBlocks } from '@/utilities/groupContentBlocks'

describe('groupContentBlocks', () => {
  it('returns an empty array for no blocks', () => {
    expect(groupContentBlocks([])).toEqual([])
  })

  it('passes heading and text blocks through in record order', () => {
    const blocks: ContentDataBlock[] = [
      { type: 'heading', text: 'The lineup' },
      { type: 'text', text: 'Five purposefully simple pieces.' },
      { type: 'heading', text: 'Why it works' },
    ]

    expect(groupContentBlocks(blocks)).toEqual([
      { type: 'heading', text: 'The lineup' },
      { type: 'text', text: 'Five purposefully simple pieces.' },
      { type: 'heading', text: 'Why it works' },
    ])
  })

  it('flattens a fashion list block that carries a whole section as an array', () => {
    const blocks: ContentDataBlock[] = [
      {
        type: 'list',
        text: [
          'Blue Moncler zip hoodie — the sporty mid-layer',
          'Moncler Down Jacket “Ryan” — the protective outer layer',
          'Siviglia grey skinny jeans — the balancing base',
        ],
      },
    ]

    expect(groupContentBlocks(blocks)).toEqual([
      {
        type: 'list',
        items: [
          'Blue Moncler zip hoodie — the sporty mid-layer',
          'Moncler Down Jacket “Ryan” — the protective outer layer',
          'Siviglia grey skinny jeans — the balancing base',
        ],
      },
    ])
  })

  it('merges an array block and a string block in the same run', () => {
    const blocks: ContentDataBlock[] = [
      { type: 'list', text: ['first', 'second'] },
      { type: 'list', text: 'third' },
    ]

    expect(groupContentBlocks(blocks)).toEqual([
      { type: 'list', items: ['first', 'second', 'third'] },
    ])
  })

  it('merges a run of consecutive single-bullet string blocks', () => {
    const blocks: ContentDataBlock[] = [
      { type: 'list', text: 'Blue Moncler zip hoodie' },
      { type: 'list', text: 'Grey Siviglia skinny jeans' },
      { type: 'list', text: 'White Philippe Model sneakers' },
    ]

    expect(groupContentBlocks(blocks)).toEqual([
      {
        type: 'list',
        items: [
          'Blue Moncler zip hoodie',
          'Grey Siviglia skinny jeans',
          'White Philippe Model sneakers',
        ],
      },
    ])
  })

  it('keeps list runs separate when a non-list block interrupts them', () => {
    const blocks: ContentDataBlock[] = [
      { type: 'list', text: 'Add a merino base layer' },
      { type: 'heading', text: 'Fit and upkeep' },
      { type: 'list', text: 'Machine wash cold' },
      { type: 'list', text: 'Reproof the shell yearly' },
    ]

    expect(groupContentBlocks(blocks)).toEqual([
      { type: 'list', items: ['Add a merino base layer'] },
      { type: 'heading', text: 'Fit and upkeep' },
      { type: 'list', items: ['Machine wash cold', 'Reproof the shell yearly'] },
    ])
  })

  it('preserves order across mixed heading, text and list runs', () => {
    const blocks: ContentDataBlock[] = [
      { type: 'heading', text: 'The role of every piece' },
      { type: 'list', text: 'Hoodie — the sporty mid-layer' },
      { type: 'list', text: 'Puffer — the outer shell' },
      { type: 'text', text: 'Layer the hoodie under the down jacket.' },
      { type: 'list', text: 'Swap sneakers for loafers' },
    ]

    expect(groupContentBlocks(blocks)).toEqual([
      { type: 'heading', text: 'The role of every piece' },
      {
        type: 'list',
        items: ['Hoodie — the sporty mid-layer', 'Puffer — the outer shell'],
      },
      { type: 'text', text: 'Layer the hoodie under the down jacket.' },
      { type: 'list', items: ['Swap sneakers for loafers'] },
    ])
  })

  // The merge path pushes into the group's items, so an array block must be
  // copied rather than aliased — otherwise it writes back into the Algolia hit.
  it('does not mutate the blocks it was given', () => {
    const blocks: ContentDataBlock[] = [
      { type: 'list', text: ['first', 'second'] },
      { type: 'list', text: 'third' },
    ]
    const snapshot = structuredClone(blocks)

    groupContentBlocks(blocks)

    expect(blocks).toEqual(snapshot)
  })
})
