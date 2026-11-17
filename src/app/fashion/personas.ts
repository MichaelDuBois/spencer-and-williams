// Fashion personas — imported by fashion/config.ts
// Each vertical defines its own personas file; consider a _config/ folder if this grows

import type { Persona } from '@/types'

export const PERSONAS: Persona[] = [
  {
    id: 'womens-apparel',
    label: "Women's Apparel",
    description: "Loves women's clothing & shoes",
    token: 'persona-womens-apparel',
    affinities: {
      'hierarchical_categories.lvl0': ['Women'],
      'hierarchical_categories.lvl1': ['Women > Clothing', 'Women > Shoes'],
    },
    optionalFilters: [
      'hierarchical_categories.lvl1:Women > Clothing<score=20>',
      'hierarchical_categories.lvl1:Women > Shoes<score=15>',
      'hierarchical_categories.lvl0:Women<score=10>',
    ],
  },
  {
    id: 'menswear',
    label: 'Menswear',
    description: "Into men's clothing & accessories",
    token: 'persona-menswear',
    affinities: {
      'hierarchical_categories.lvl1': ['Men > Clothing', 'Accessories > Men'],
    },
    optionalFilters: [
      'hierarchical_categories.lvl1:Men > Clothing<score=20>',
      'hierarchical_categories.lvl1:Accessories > Men<score=15>',
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    description: 'Bags & accessories enthusiast',
    token: 'persona-accessories',
    affinities: {
      'hierarchical_categories.lvl0': ['Accessories'],
      'hierarchical_categories.lvl1': [
        'Women > Bags',
        'Accessories > Women',
        'Accessories > Men',
      ],
    },
    optionalFilters: [
      'hierarchical_categories.lvl1:Women > Bags<score=20>',
      'hierarchical_categories.lvl1:Accessories > Women<score=15>',
      'hierarchical_categories.lvl1:Accessories > Men<score=10>',
      'hierarchical_categories.lvl0:Accessories<score=10>',
    ],
  },
  {
    id: 'emily-topaz',
    label: 'Emily Topaz',
    description: "Women's clothing, bags & shoes",
    token: 'emilytopaz-fashion',
    affinities: {
      'hierarchical_categories.lvl1': [
        'Women > Clothing',
        'Women > Bags',
        'Women > Shoes',
      ],
    },
    optionalFilters: [
      'hierarchical_categories.lvl1:Women > Clothing<score=18>',
      'hierarchical_categories.lvl1:Women > Bags<score=15>',
      'hierarchical_categories.lvl1:Women > Shoes<score=12>',
    ],
  },
  {
    id: 'michael-emerald',
    label: 'Michael Emerald',
    description: "Men's clothing, shoes & accessories",
    token: 'michaelemerald-fashion',
    affinities: {
      'hierarchical_categories.lvl1': [
        'Men > Clothing',
        'Men > Shoes',
        'Accessories > Men',
      ],
    },
    optionalFilters: [
      'hierarchical_categories.lvl1:Men > Clothing<score=18>',
      'hierarchical_categories.lvl1:Men > Shoes<score=15>',
      'hierarchical_categories.lvl1:Accessories > Men<score=12>',
    ],
  },
  {
    id: 'sophia-topaz',
    label: 'Sophia Topaz',
    description: "Women's shoes & accessories",
    token: 'sophiatopaz-fashion',
    affinities: {
      'hierarchical_categories.lvl1': ['Women > Shoes', 'Accessories > Women'],
    },
    optionalFilters: [
      'hierarchical_categories.lvl1:Women > Shoes<score=18>',
      'hierarchical_categories.lvl1:Accessories > Women<score=15>',
    ],
  },
]
