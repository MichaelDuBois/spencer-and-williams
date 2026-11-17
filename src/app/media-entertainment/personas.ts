// Media & Entertainment viewer profiles — imported by media-entertainment/config.ts

import type { Persona } from '@/types'

export const PERSONAS: Persona[] = [
  {
    id: 'marvel-fan',
    label: 'Ava',
    description: 'Marvel, superheroes & blockbusters',
    token: 'ava-media-marvel',
    affinities: {
      keywords: [
        'marvel cinematic universe (mcu)',
        'superhero',
        'superhero team',
      ],
      genres: ['Action', 'Adventure', 'Science Fiction'],
    },
    assistantPrompts: [
      'What Marvel should I watch next?',
      'A superhero story with a darker tone',
      'Big action blockbusters from the last few years',
      'Space adventures like Guardians of the Galaxy',
    ],
    optionalFilters: [
      'keywords:marvel cinematic universe (mcu)<score=20>',
      'keywords:superhero<score=16>',
      'keywords:superhero team<score=14>',
      'genres:Action<score=10>',
      'genres:Adventure<score=8>',
      'genres:Science Fiction<score=6>',
    ],
  },
  {
    id: 'kids-family',
    label: 'Noah',
    description: 'Animation, family films & kids TV',
    token: 'noah-media-family',
    affinities: {
      genres: ['Animation', 'Family', 'Kids'],
      certification: ['G', 'PG', 'TV-Y7'],
    },
    assistantPrompts: [
      'An animated movie the whole family will like',
      'Something funny for a six-year-old',
      'A family adventure under 100 minutes',
      'Shows with talking animals',
    ],
    // Scored rather than hard-filtered on purpose: a `certification` filter would
    // also drop every unrated title, and `NR` is the largest value in the index.
    optionalFilters: [
      'genres:Animation<score=20>',
      'genres:Family<score=18>',
      'genres:Kids<score=16>',
      'certification:G<score=12>',
      'certification:PG<score=10>',
      'certification:TV-Y7<score=8>',
    ],
  },
]
