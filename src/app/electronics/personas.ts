import type { Persona } from '@/types'

export const PERSONAS: Persona[] = [
  {
    id: 'alex-sapphire',
    label: 'Alex Sapphire',
    description: 'Cell phones & OLED TVs',
    token: 'alexsapphire-electronics',
    affinities: {
      category: ['Cell Phones', 'OLED TVs'],
    },
    optionalFilters: [
      'category:Cell Phones<score=18>',
      'category:OLED TVs<score=15>',
    ],
  },
  {
    id: 'linda-gregson',
    label: 'Linda Gregson',
    description: 'LED & LCD TVs, phone cases, movies & TV',
    token: 'lindagregson-electronics',
    affinities: {
      category: ['LED & LCD TVs', 'Basic Cases'],
      'hierarchicalCategories.level0': ['Movies & TV'],
    },
    optionalFilters: [
      'category:LED & LCD TVs<score=18>',
      'category:Basic Cases<score=15>',
      'hierarchicalCategories.level0:Movies & TV<score=12>',
    ],
  },
  {
    id: 'mark-lee',
    label: 'Mark Lee',
    description: 'Phone cases & smartwatches',
    token: 'marklee-electronics',
    affinities: {
      category: ['Basic Cases', 'Smartwatches'],
    },
    optionalFilters: [
      'category:Basic Cases<score=18>',
      'category:Smartwatches<score=12>',
    ],
  },
  {
    id: 'emily-walker',
    label: 'Emily Walker',
    description: 'QLED TVs & portable audio',
    token: 'emilywalker-electronics',
    affinities: {
      category: ['QLED TVs'],
      'hierarchicalCategories.level1': ['Electronics > Portable Audio & Video'],
    },
    optionalFilters: [
      'category:QLED TVs<score=18>',
      'hierarchicalCategories.level1:Electronics > Portable Audio & Video<score=15>',
    ],
  },
  {
    id: 'robert-hall',
    label: 'Robert Hall',
    description: 'Cell phones, laptops & video games',
    token: 'roberthall-electronics',
    affinities: {
      category: ['Cell Phones', 'Traditional Laptops'],
      'hierarchicalCategories.level1': [
        'Video Games > PC',
        'Video Games > PlayStation 4',
      ],
    },
    optionalFilters: [
      'category:Cell Phones<score=18>',
      'hierarchicalCategories.level1:Video Games > PC<score=15>',
      'hierarchicalCategories.level1:Video Games > PlayStation 4<score=15>',
      'category:Traditional Laptops<score=12>',
    ],
  },
]
