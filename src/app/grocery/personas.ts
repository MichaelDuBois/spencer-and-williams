import type { Persona } from '@/types'

export const PERSONAS: Persona[] = [
  {
    id: 'alex-sapphire',
    label: 'Alex Sapphire',
    description: 'Coffee, cooking & baking, bottled drinks',
    token: 'alexsapphire-grocery',
    affinities: {
      'hierarchicalCategories.level1': [
        'Beverages > Coffee',
        'Pantry Staples > Cooking & Baking',
        'Beverages > Bottled Beverages, Water & Drink Mixes',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Beverages > Coffee<score=18>',
      'hierarchicalCategories.level1:Pantry Staples > Cooking & Baking<score=15>',
      'hierarchicalCategories.level1:Beverages > Bottled Beverages, Water & Drink Mixes<score=12>',
    ],
  },
  {
    id: 'linda-gregson',
    label: 'Linda Gregson',
    description: 'Cooking, baking & spices',
    token: 'lindagregson-grocery',
    affinities: {
      'hierarchicalCategories.level1': [
        'Pantry Staples > Cooking & Baking',
        'Pantry Staples > Herbs, Spices & Seasonings',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Pantry Staples > Cooking & Baking<score=18>',
      'hierarchicalCategories.level1:Pantry Staples > Herbs, Spices & Seasonings<score=15>',
    ],
  },
  {
    id: 'mark-lee',
    label: 'Mark Lee',
    description: 'Bottled drinks, coffee, hot chocolate',
    token: 'marklee-grocery',
    affinities: {
      'hierarchicalCategories.level1': [
        'Beverages > Bottled Beverages, Water & Drink Mixes',
        'Beverages > Coffee',
        'Beverages > Hot Chocolate & Malted Drinks',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Beverages > Bottled Beverages, Water & Drink Mixes<score=18>',
      'hierarchicalCategories.level1:Beverages > Coffee<score=15>',
      'hierarchicalCategories.level1:Beverages > Hot Chocolate & Malted Drinks<score=12>',
    ],
  },
  {
    id: 'jenny-foster',
    label: 'Jenny Foster',
    description: 'Plant-based milk, cheese & yogurt',
    token: 'jennyfoster-grocery',
    affinities: {
      'hierarchicalCategories.level1': [
        'Dairy, Eggs & Plant-Based Alternatives > Plant-Based Milk',
        'Dairy, Eggs & Plant-Based Alternatives > Cheese',
        'Dairy, Eggs & Plant-Based Alternatives > Dairy & Plant-Based Yogurt',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Dairy, Eggs & Plant-Based Alternatives > Plant-Based Milk<score=18>',
      'hierarchicalCategories.level1:Dairy, Eggs & Plant-Based Alternatives > Cheese<score=15>',
      'hierarchicalCategories.level1:Dairy, Eggs & Plant-Based Alternatives > Dairy & Plant-Based Yogurt<score=12>',
    ],
  },
  {
    id: 'dave-morgan',
    label: 'Dave Morgan',
    description: 'Pasta, cooking & baking',
    token: 'davemorgan-grocery',
    affinities: {
      'hierarchicalCategories.level1': [
        'Pasta, Potatoes & Side Dishes > Pasta & Pizza',
        'Pantry Staples > Cooking & Baking',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Pasta, Potatoes & Side Dishes > Pasta & Pizza<score=18>',
      'hierarchicalCategories.level1:Pantry Staples > Cooking & Baking<score=12>',
    ],
  },
]
