import type { NavigationItem } from '@/types/verticalConfig.types'

export const navCategories: NavigationItem[] = [
  {
    label: 'Women',
    category: 'Women',
    illustrationImage:
      'https://images.unsplash.com/photo-1600443932102-f654550f0a86?q=80&w=2085&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    children: [
      {
        label: 'Bags',
        category: 'Women > Bags',
        children: [
          {
            label: 'Shoulder bags',
            category: 'Women > Bags > Shoulder bags',
          },
          {
            label: 'Handbag',
            category: 'Women > Bags > Handbag',
          },
          {
            label: 'Wallets',
            category: 'Women > Bags > Wallets',
          },
          {
            label: 'Shopper',
            category: 'Women > Bags > Shopper',
          },
          {
            label: 'Clutches',
            category: 'Women > Bags > Clutches',
          },
        ],
      },
      {
        label: 'Clothing',
        category: 'Women > Clothing',
        children: [
          {
            label: 'T-shirts',
            category: 'Women > Clothing > T-shirts',
          },
          {
            label: 'Jackets',
            category: 'Women > Clothing > Jackets',
          },
          {
            label: 'Jeans',
            category: 'Women > Clothing > Jeans',
          },
          {
            label: 'Tops',
            category: 'Women > Clothing > Tops',
          },
          {
            label: 'Dresses',
            category: 'Women > Clothing > Dresses',
          },
          {
            label: 'Skirts',
            category: 'Women > Clothing > Skirts',
          },
        ],
      },
      {
        label: 'Shoes',
        category: 'Women > Shoes',
        children: [
          {
            label: 'Sneakers',
            category: 'Women > Shoes > Sneakers',
          },
          {
            label: 'Sandals',
            category: 'Women > Shoes > Sandals',
          },
          {
            label: 'Loafers',
            category: 'Women > Shoes > Loafers',
          },
          {
            label: 'Pumps',
            category: 'Women > Shoes > Pumps',
          },
          {
            label: 'Ballerinas',
            category: 'Women > Shoes > Ballerinas',
          },
          {
            label: 'Ankle boots',
            category: 'Women > Shoes > Ankle boots',
          },
        ],
      },
    ],
  },
  {
    label: 'Men',
    category: 'Men',
    illustrationImage:
      'https://images.unsplash.com/photo-1525187440203-df529491b0a4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    children: [
      {
        label: 'Clothing',
        category: 'Men > Clothing',
        children: [
          {
            label: 'T-shirts',
            category: 'Men > Clothing > T-shirts',
          },
          {
            label: 'Jackets',
            category: 'Men > Clothing > Jackets',
          },
          {
            label: 'Tops',
            category: 'Men > Clothing > Tops',
          },
          {
            label: 'Trousers',
            category: 'Men > Clothing > Trousers',
          },
          {
            label: 'Shirts',
            category: 'Men > Clothing > Shirts',
          },
          {
            label: 'Jeans',
            category: 'Men > Clothing > Jeans',
          },
        ],
      },
      {
        label: 'Shoes',
        category: 'Men > Shoes',
        children: [
          {
            label: 'Sneakers',
            category: 'Men > Shoes > Sneakers',
          },
          {
            label: 'Loafers',
            category: 'Men > Shoes > Loafers',
          },
          {
            label: 'Lace-up shoes',
            category: 'Men > Shoes > Lace-up shoes',
          },
        ],
      },
    ],
  },
  {
    label: 'Accessories',
    category: 'Accessories',
    illustrationImage:
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=640&q=80',
    children: [
      {
        label: 'Women',
        category: 'Accessories > Women',
        children: [
          {
            label: 'Clothing',
            category: 'Accessories > Women > Clothing',
          },
          {
            label: 'Looks',
            category: 'Accessories > Women > Looks',
          },
          {
            label: 'Sunglasses',
            category: 'Accessories > Women > Sunglasses',
          },
        ],
      },
      {
        label: 'Men',
        category: 'Accessories > Men',
        children: [
          {
            label: 'Clothing',
            category: 'Accessories > Men > Clothing',
          },
        ],
      },
    ],
  },
]
