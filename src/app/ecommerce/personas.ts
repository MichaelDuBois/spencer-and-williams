// Ecommerce personas — imported by ecommerce/config.ts
// Each vertical defines its own personas file; consider a _config/ folder if this grows

import type { Persona } from '@/types'

export const PERSONAS: Persona[] = [
  {
    id: 'sports-fan',
    label: 'Sports Fan',
    description: "Men's running shoes from Brooks & adidas",
    token: 'persona-sports-fan',
    affinities: {
      'hierarchicalCategories.level2': [
        'Clothing, Shoes & Jewelry > Men > Shoes',
      ],
      category: ['Road Running'],
      brand: ['Brooks', 'adidas'],
    },
    optionalFilters: [
      'hierarchicalCategories.level2:Clothing, Shoes & Jewelry > Men > Shoes<score=20>',
      'category:Road Running<score=15>',
      'brand:Brooks<score=5>',
      'brand:adidas<score=5>',
    ],
  },
  {
    id: 'tech-enthusiast',
    label: 'Tech Enthusiast',
    description: 'Dell & Samsung laptops and computers',
    token: 'persona-tech-enthusiast',
    affinities: {
      'hierarchicalCategories.level2': [
        'Electronics > Computers & Accessories > Computers & Tablets',
      ],
      category: ['Traditional Laptops'],
      brand: ['Dell', 'SAMSUNG'],
    },
    optionalFilters: [
      'hierarchicalCategories.level2:Electronics > Computers & Accessories > Computers & Tablets<score=20>',
      'category:Traditional Laptops<score=20>',
      'brand:Dell<score=5>',
      'brand:SAMSUNG<score=5>',
    ],
  },
  {
    id: 'home-living',
    label: 'Home & Living',
    description: 'Kitchen & dining enthusiast',
    token: 'persona-home-living',
    affinities: {
      'hierarchicalCategories.level1': ['Home & Kitchen > Kitchen & Dining'],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Home & Kitchen > Kitchen & Dining<score=20>',
    ],
  },
  {
    id: 'alex-sapphire',
    label: 'Alex Sapphire',
    description: "Men's fashion & computers",
    token: 'alexsapphire-ecom-o5p',
    affinities: {
      'hierarchicalCategories.level1': [
        'Clothing, Shoes & Jewelry > Men',
        'Electronics > Computers & Accessories',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Clothing, Shoes & Jewelry > Men<score=20>',
      'hierarchicalCategories.level1:Electronics > Computers & Accessories<score=10>',
    ],
  },
  {
    id: 'linda-gregson',
    label: 'Linda Gregson',
    description: "Home décor, women's fashion & kitchen",
    token: 'lindagregson-ecom-o5p',
    affinities: {
      'hierarchicalCategories.level1': [
        'Home & Kitchen > Home Décor Products',
        'Clothing, Shoes & Jewelry > Women',
        'Home & Kitchen > Kitchen & Dining',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Home & Kitchen > Home Décor Products<score=20>',
      'hierarchicalCategories.level1:Clothing, Shoes & Jewelry > Women<score=15>',
      'hierarchicalCategories.level1:Home & Kitchen > Kitchen & Dining<score=10>',
    ],
  },
  {
    id: 'mark-lee',
    label: 'Mark Lee',
    description: 'Electronics & tools',
    token: 'marklee-ecom-o5p',
    affinities: {
      'hierarchicalCategories.level1': [
        'Electronics > Computers & Accessories',
        'Tools & Home Improvement > Power & Hand Tools',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Electronics > Computers & Accessories<score=20>',
      'hierarchicalCategories.level1:Tools & Home Improvement > Power & Hand Tools<score=15>',
    ],
  },
  {
    id: 'john-smith',
    label: 'John Smith',
    description: 'Home décor & office supplies',
    token: 'johnsmith-ecom-o5p',
    affinities: {
      'hierarchicalCategories.level1': [
        'Home & Kitchen > Home Décor Products',
        'Office Products > Office & School Supplies',
      ],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Home & Kitchen > Home Décor Products<score=15>',
      'hierarchicalCategories.level1:Office Products > Office & School Supplies<score=15>',
    ],
  },
  {
    id: 'sara-jones',
    label: 'Sara Jones',
    description: "Women's clothing & shoes",
    token: 'sarajones-ecom-o5p',
    affinities: {
      'hierarchicalCategories.level1': ['Clothing, Shoes & Jewelry > Women'],
    },
    optionalFilters: [
      'hierarchicalCategories.level1:Clothing, Shoes & Jewelry > Women<score=10>',
    ],
  },
]
