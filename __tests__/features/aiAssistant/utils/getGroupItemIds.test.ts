import { describe, expect, it } from 'vitest'

import type {
  B2BContentDisplayGroup,
  DisplayGroup,
  TravelDisplayGroup,
} from '@/features/aiAssistant/types'
import { getGroupItemIds } from '@/features/aiAssistant/utils/getGroupItemIds'


describe('getGroupItemIds', () => {
  it('reads objectIDs from a products group', () => {
    const group = {
      products: [{ objectID: 'p1' }, { objectID: 'p2' }],
    } as DisplayGroup
    expect(getGroupItemIds(group)).toEqual(['p1', 'p2'])
  })

  it('reads objectIDs from an items group (travel / b2b)', () => {
    const group = {
      items: [{ objectID: 'i1' }, { objectID: 'i2' }],
    } as unknown as TravelDisplayGroup
    expect(getGroupItemIds(group)).toEqual(['i1', 'i2'])
  })

  it('returns an empty array when the group has neither products nor items', () => {
    expect(getGroupItemIds({} as B2BContentDisplayGroup)).toEqual([])
  })
})
