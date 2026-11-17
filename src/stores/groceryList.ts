import { atomWithStorage } from 'jotai/utils'

export const groceryListAtom = atomWithStorage<string[]>(
  'spencer-williams-grocery-list',
  [],
)
