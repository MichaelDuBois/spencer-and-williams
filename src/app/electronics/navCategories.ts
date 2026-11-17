import type { NavigationItem } from '@/types/verticalConfig.types'

export const navCategories: NavigationItem[] = [
  {
    label: 'Electronics',
    category: 'Electronics',
    illustrationImage:
      'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?auto=format&fit=crop&w=640&q=80',
    children: [
      {
        label: 'Computers & Accessories',
        category: 'Electronics > Computers & Accessories',
      },
      {
        label: 'Camera & Photo',
        category: 'Electronics > Camera & Photo',
      },
      {
        label: 'Headphones, Earbuds & Accessories',
        category: 'Electronics > Headphones, Earbuds & Accessories',
      },
      {
        label: 'Television & Video',
        category: 'Electronics > Television & Video',
      },
      {
        label: 'Car & Vehicle Electronics',
        category: 'Electronics > Car & Vehicle Electronics',
      },
      {
        label: 'Home Audio',
        category: 'Electronics > Home Audio',
      },
      {
        label: 'Portable Audio & Video',
        category: 'Electronics > Portable Audio & Video',
      },
      {
        label: 'Accessories & Supplies',
        category: 'Electronics > Accessories & Supplies',
      },
    ],
  },
  {
    label: 'Cell Phones & Accessories',
    category: 'Cell Phones & Accessories',
    illustrationImage:
      'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=640&q=80',
    children: [
      {
        label: 'Cases, Holsters & Sleeves',
        category: 'Cell Phones & Accessories > Cases, Holsters & Sleeves',
        children: [
          {
            label: 'Basic Cases',
            category:
              'Cell Phones & Accessories > Cases, Holsters & Sleeves > Basic Cases',
          },
          {
            label: 'Flip Cases',
            category:
              'Cell Phones & Accessories > Cases, Holsters & Sleeves > Flip Cases',
          },
          {
            label: 'Holsters',
            category:
              'Cell Phones & Accessories > Cases, Holsters & Sleeves > Holsters',
          },
          {
            label: 'Battery Charger Cases',
            category:
              'Cell Phones & Accessories > Cases, Holsters & Sleeves > Battery Charger Cases',
          },
          {
            label: 'Armbands',
            category:
              'Cell Phones & Accessories > Cases, Holsters & Sleeves > Armbands',
          },
          {
            label: 'Sleeves',
            category:
              'Cell Phones & Accessories > Cases, Holsters & Sleeves > Sleeves',
          },
        ],
      },
      {
        label: 'Accessories',
        category: 'Cell Phones & Accessories > Accessories',
        children: [
          {
            label: 'Maintenance, Upkeep & Repairs',
            category:
              'Cell Phones & Accessories > Accessories > Maintenance, Upkeep & Repairs',
          },
          {
            label: 'Smartwatch Accessories',
            category:
              'Cell Phones & Accessories > Accessories > Smartwatch Accessories',
          },
          {
            label: 'Chargers & Power Adapters',
            category:
              'Cell Phones & Accessories > Accessories > Chargers & Power Adapters',
          },
          {
            label: 'Stands',
            category: 'Cell Phones & Accessories > Accessories > Stands',
          },
          {
            label: 'Automobile Accessories',
            category:
              'Cell Phones & Accessories > Accessories > Automobile Accessories',
          },
          {
            label: 'Photo & Video Accessories',
            category:
              'Cell Phones & Accessories > Accessories > Photo & Video Accessories',
          },
        ],
      },
      {
        label: 'Cell Phones',
        category: 'Cell Phones & Accessories > Cell Phones',
      },
    ],
  },
  {
    label: 'Video Games',
    category: 'Video Games',
    illustrationImage:
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    children: [
      {
        label: 'Legacy Systems',
        category: 'Video Games > Legacy Systems',
      },
      {
        label: 'PC',
        category: 'Video Games > PC',
      },
      {
        label: 'PlayStation 4',
        category: 'Video Games > PlayStation 4',
      },
      {
        label: 'Nintendo Switch',
        category: 'Video Games > Nintendo Switch',
      },
      {
        label: 'Xbox One',
        category: 'Video Games > Xbox One',
      },
      {
        label: 'Online Game Services',
        category: 'Video Games > Online Game Services',
      },
      {
        label: 'Mac',
        category: 'Video Games > Mac',
      },
      {
        label: 'PlayStation 5',
        category: 'Video Games > PlayStation 5',
      },
    ],
  },
  {
    label: 'Movies & TV',
    category: 'Movies & TV',
    illustrationImage:
      'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    children: [
      {
        label: 'Genre for Featured Categories',
        category: 'Movies & TV > Genre for Featured Categories',
      },
      {
        label: 'Blu-ray',
        category: 'Movies & TV > Blu-ray',
      },
      {
        label: 'Studio Specials',
        category: 'Movies & TV > Studio Specials',
      },
      {
        label: 'Movies',
        category: 'Movies & TV > Movies',
      },
      {
        label: 'Boxed Sets',
        category: 'Movies & TV > Boxed Sets',
      },
      {
        label: 'TV',
        category: 'Movies & TV > TV',
      },
      {
        label: 'Paramount Home Entertainment',
        category: 'Movies & TV > Paramount Home Entertainment',
      },
      {
        label: 'Science Fiction & Fantasy',
        category: 'Movies & TV > Science Fiction & Fantasy',
      },
    ],
  },
  {
    label: 'CDs & Vinyl',
    category: 'CDs & Vinyl',
    illustrationImage:
      'https://images.unsplash.com/photo-1609721560353-bb26786c0ee6?auto=format&fit=crop&w=640&q=80',
    children: [
      {
        label: 'Pop',
        category: 'CDs & Vinyl > Pop',
      },
      {
        label: 'Rock',
        category: 'CDs & Vinyl > Rock',
      },
      {
        label: 'Indie & Alternative',
        category: 'CDs & Vinyl > Indie & Alternative',
      },
      {
        label: 'International Music',
        category: 'CDs & Vinyl > International Music',
      },
      {
        label: 'Country',
        category: 'CDs & Vinyl > Country',
      },
      {
        label: 'Classical',
        category: 'CDs & Vinyl > Classical',
      },
      {
        label: 'Classic Rock',
        category: 'CDs & Vinyl > Classic Rock',
      },
      {
        label: 'Jazz',
        category: 'CDs & Vinyl > Jazz',
      },
    ],
  },
]
