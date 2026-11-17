import type { Persona } from '@/types'

export const PERSONAS: Persona[] = [
  {
    id: 'office-fan',
    label: 'Office Fan',
    description: 'Home office desks & work setups',
    token: 'persona-office-fan',
    affinities: {
      category: ['Home Office Desks', 'Home Office Desk Chairs'],
      'attrs.Room Type': ['Office', 'Home Office'],
    },
    optionalFilters: [
      'category:Home Office Desks<score=20>',
      'category:Home Office Desk Chairs<score=15>',
      'attrs.Room Type:Office<score=12>',
      'attrs.Room Type:Home Office<score=8>',
    ],
  },
  {
    id: 'decor-enthusiast',
    label: 'Décor Enthusiast',
    description: 'Home décor & living room furniture',
    token: 'persona-decor-enthusiast',
    affinities: {
      'hierarchicalCategories.level1': ['Home & Kitchen > Home Décor Products'],
      'hierarchicalCategories.level2': [
        'Home & Kitchen > Furniture > Living Room Furniture',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Home & Kitchen > Home Décor Products<score=20>',
      'hierarchicalCategories.level2:Home & Kitchen > Furniture > Living Room Furniture<score=10>',
    ],
  },
  {
    id: 'sarah-johnson',
    label: 'Sarah Johnson',
    description: 'Living room, bedroom & office furniture',
    token: 'sarahjohnson-furnishings',
    affinities: {
      'hierarchicalCategories.level2': [
        'Home & Kitchen > Furniture > Home Office Furniture',
        'Home & Kitchen > Furniture > Living Room Furniture',
        'Home & Kitchen > Furniture > Bedroom Furniture',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level2:Home & Kitchen > Furniture > Home Office Furniture<score=18>',
      'hierarchicalCategories.level2:Home & Kitchen > Furniture > Living Room Furniture<score=15>',
      'hierarchicalCategories.level2:Home & Kitchen > Furniture > Bedroom Furniture<score=15>',
    ],
  },
  {
    id: 'emily-walker',
    label: 'Emily Walker',
    description: 'Bedroom & living room furniture',
    token: 'emilywalker-furnishings',
    affinities: {
      'hierarchicalCategories.level2': [
        'Home & Kitchen > Furniture > Bedroom Furniture',
        'Home & Kitchen > Furniture > Living Room Furniture',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level2:Home & Kitchen > Furniture > Bedroom Furniture<score=18>',
      'hierarchicalCategories.level2:Home & Kitchen > Furniture > Living Room Furniture<score=15>',
    ],
  },
  {
    id: 'linda-williams',
    label: 'Linda Williams',
    description: 'Living room, bedroom & headboards',
    token: 'lindawilliams-furnishings',
    affinities: {
      category: ['Headboards'],
      'hierarchicalCategories.level2': [
        'Home & Kitchen > Furniture > Bedroom Furniture',
        'Home & Kitchen > Furniture > Living Room Furniture',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level2:Home & Kitchen > Furniture > Bedroom Furniture<score=18>',
      'hierarchicalCategories.level2:Home & Kitchen > Furniture > Living Room Furniture<score=15>',
      'category:Headboards<score=12>',
    ],
  },
]
