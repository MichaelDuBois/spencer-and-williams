import type { Persona } from '@/types'

export const PERSONAS: Persona[] = [
  {
    id: 'lena',
    label: 'Lena',
    description: 'Photography, wildlife & adventure',
    token: 'lena-travel-v2',
    affinities: {
      tags: ['photography', 'wildlife', 'adventure'],
    },
    optionalFilters: [
      'tags:photography<score=18>',
      'tags:wildlife<score=15>',
      'tags:adventure<score=12>',
    ],
  },
  {
    id: 'marco',
    label: 'Marco',
    description: 'Sustainable travel, local life & culture',
    token: 'marco-travel-v2',
    affinities: {
      tags: ['sustainable-travel', 'local-life', 'culture'],
    },
    optionalFilters: [
      'tags:sustainable-travel<score=18>',
      'tags:local-life<score=15>',
      'tags:culture<score=12>',
    ],
  },
  {
    id: 'sofia',
    label: 'Sofia',
    description: 'Food, local life & history',
    token: 'sofia-travel-v2',
    affinities: {
      tags: ['food', 'local-life', 'history'],
    },
    optionalFilters: [
      'tags:food<score=18>',
      'tags:local-life<score=15>',
      'tags:history<score=12>',
    ],
  },
  {
    id: 'james',
    label: 'James',
    description: 'Adventure, hiking & photography',
    token: 'james-travel-v2',
    affinities: {
      tags: ['adventure', 'hiking', 'photography'],
    },
    optionalFilters: [
      'tags:adventure<score=18>',
      'tags:hiking<score=15>',
      'tags:photography<score=12>',
    ],
  },
  {
    id: 'aisha',
    label: 'Aisha',
    description: 'Walking, travel tips & local life',
    token: 'aisha-travel-v2',
    affinities: {
      tags: ['walking', 'travel-tips', 'local-life'],
    },
    optionalFilters: [
      'tags:walking<score=18>',
      'tags:travel-tips<score=15>',
      'tags:local-life<score=12>',
    ],
  },
]
