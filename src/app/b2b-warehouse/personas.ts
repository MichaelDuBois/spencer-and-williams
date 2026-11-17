import type { Persona } from '@/types'

export const PERSONAS: Persona[] = [
  {
    id: 'dewalt-pro',
    label: 'DeWalt Pro',
    description: 'Loyal to DeWalt power tools & abrasives',
    token: 'persona-b2b-dewalt',
    affinities: {
      brand: ['DEWALT'],
      'hierarchicalCategories.level0': ['Power Tools', 'Abrasives'],
    },
    optionalFilters: [
      'brand:DEWALT<score=20>',
      'hierarchicalCategories.level0:Power Tools<score=12>',
      'hierarchicalCategories.level1:Abrasives > Coated Abrasives<score=10>',
      'hierarchicalCategories.level1:Cutting Tools & Metalworking > Saw Blades<score=8>',
    ],
  },
  {
    id: 'milwaukee-pro',
    label: 'Milwaukee Pro',
    description: 'Prefers Milwaukee cutting & hand tools',
    token: 'persona-b2b-milwaukee',
    affinities: {
      brand: ['MILWAUKEE'],
      'hierarchicalCategories.level0': [
        'Cutting Tools & Metalworking',
        'Hand Tools',
      ],
    },
    optionalFilters: [
      'brand:MILWAUKEE<score=20>',
      'hierarchicalCategories.level1:Cutting Tools & Metalworking > Drilling & Holemaking<score=12>',
      'hierarchicalCategories.level0:Hand Tools<score=10>',
      'hierarchicalCategories.level1:Power Tools > Holemaking & Fastening Power Tools<score=8>',
    ],
  },
  {
    id: 'facilities-safety-lead',
    label: 'Facilities Safety Lead',
    description: 'Stocks workplace safety signs',
    token: 'facilities-safety-lead-b2b-1',
    affinities: {
      'hierarchicalCategories.level1': [
        'Safety & Security > Identification Products',
      ],
      category: ['Accident Prevention Signs'],
      brand: ['ACCUFORM'],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Safety & Security > Identification Products<score=18>',
      'category:Accident Prevention Signs<score=15>',
      'brand:ACCUFORM<score=12>',
    ],
  },
  {
    id: 'mike-anderson',
    label: 'Mike Anderson',
    description: 'Maintenance tech focused on drilling & holemaking',
    token: 'mike-anderson-b2b-1',
    affinities: {
      'hierarchicalCategories.level1': [
        'Cutting Tools & Metalworking > Drilling & Holemaking',
      ],
      brand: ['MILWAUKEE', 'DEWALT'],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Cutting Tools & Metalworking > Drilling & Holemaking<score=18>',
      'brand:MILWAUKEE<score=15>',
      'brand:DEWALT<score=12>',
    ],
  },
  {
    id: 'cnc-machinist',
    label: 'CNC Machinist',
    description: 'Sources drilling tools & saw blades for metalworking',
    token: 'cnc-machinist-b2b-1',
    affinities: {
      'hierarchicalCategories.level0': ['Cutting Tools & Metalworking'],
      'hierarchicalCategories.level1': [
        'Cutting Tools & Metalworking > Drilling & Holemaking',
        'Cutting Tools & Metalworking > Saw Blades',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Cutting Tools & Metalworking > Drilling & Holemaking<score=18>',
      'hierarchicalCategories.level1:Cutting Tools & Metalworking > Saw Blades<score=15>',
    ],
  },
  {
    id: 'rigging-supervisor',
    label: 'Rigging Supervisor',
    description: 'Sources hoists & trolleys for lifting',
    token: 'rigging-supervisor-b2b-1',
    affinities: {
      'hierarchicalCategories.level1': [
        'Slings, Lifting, & Rigging > Hoists & Trolleys',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Slings, Lifting, & Rigging > Hoists & Trolleys<score=18>',
    ],
  },
]
