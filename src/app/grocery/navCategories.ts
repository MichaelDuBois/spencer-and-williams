import type { NavigationItem } from '@/types/verticalConfig.types'

export const navCategories: NavigationItem[] = [
  {
    label: 'Pantry',
    category: 'Pantry Staples',
    illustrationImage:
      'https://images.unsplash.com/photo-1542990253-a781e04c0082?auto=format&fit=crop&w=640&q=80',
    children: [
      {
        label: 'Cooking & Baking',
        category: 'Pantry Staples > Cooking & Baking',
      },
      {
        label: 'Herbs, Spices & Seasonings',
        category: 'Pantry Staples > Herbs, Spices & Seasonings',
      },
      {
        label: 'Sauces, Gravies & Marinades',
        category: 'Pantry Staples > Sauces, Gravies & Marinades',
      },
      {
        label: 'Canned, Jarred & Packaged Foods',
        category: 'Pantry Staples > Canned, Jarred & Packaged Foods',
      },
      {
        label: 'Soups, Stocks & Broths',
        category: 'Pantry Staples > Soups, Stocks & Broths',
      },
      {
        label: 'Condiments & Salad Dressings',
        category: 'Pantry Staples > Condiments & Salad Dressings',
      },
      {
        label: 'Nut & Seed Butters',
        category: 'Pantry Staples > Nut & Seed Butters',
      },
      {
        label: 'Pasta & Noodles',
        category: 'Pantry Staples > Pasta & Noodles',
      },
    ],
  },
  {
    label: 'Breads & Bakery',
    category: 'Breads & Bakery',
    illustrationImage:
      'https://images.unsplash.com/photo-1509957879660-dd8846a0b43d?auto=format&fit=crop&w=640&q=80',
    children: [
      {
        label: 'Cookies',
        category: 'Breads & Bakery > Cookies',
      },
      {
        label: 'Breads',
        category: 'Breads & Bakery > Breads',
      },
      {
        label: 'Pastries & Bakery',
        category: 'Breads & Bakery > Pastries & Bakery',
      },
      {
        label: 'Cakes',
        category: 'Breads & Bakery > Cakes',
      },
      {
        label: 'Desserts',
        category: 'Breads & Bakery > Desserts',
      },
      {
        label: 'Pizza Crusts',
        category: 'Breads & Bakery > Pizza Crusts',
      },
      {
        label: 'Breadsticks',
        category: 'Breads & Bakery > Breadsticks',
      },
      {
        label: 'Refrigerated Doughs',
        category: 'Breads & Bakery > Refrigerated Doughs',
      },
    ],
  },
  {
    label: 'Meat & Seafood',
    category: 'Meat & Seafood',
    illustrationImage:
      'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    children: [
      {
        label: 'Beef',
        category: 'Meat & Seafood > Beef',
      },
      {
        label: 'Seafood',
        category: 'Meat & Seafood > Seafood',
      },
      {
        label: 'Sausages',
        category: 'Meat & Seafood > Sausages',
      },
      {
        label: 'Chicken',
        category: 'Meat & Seafood > Chicken',
      },
      {
        label: 'Pork',
        category: 'Meat & Seafood > Pork',
      },
      {
        label: 'Hot Dogs & Franks',
        category: 'Meat & Seafood > Hot Dogs & Franks',
      },
      {
        label: 'Turkey',
        category: 'Meat & Seafood > Turkey',
      },
    ],
  },
  {
    label: 'Beverages',
    category: 'Beverages',
    illustrationImage:
      'https://images.unsplash.com/photo-1496318447583-f524534e9ce1?auto=format&fit=crop&w=640&q=80',
    children: [
      {
        label: 'Bottled Beverages, Water & Drink Mixes',
        category: 'Beverages > Bottled Beverages, Water & Drink Mixes',
      },
      {
        label: 'Tea',
        category: 'Beverages > Tea',
      },
      {
        label: 'Coffee',
        category: 'Beverages > Coffee',
      },
      {
        label: 'Beverage Syrups & Concentrates',
        category: 'Beverages > Beverage Syrups & Concentrates',
      },
      {
        label: 'Hot Chocolate & Malted Drinks',
        category: 'Beverages > Hot Chocolate & Malted Drinks',
      },
      {
        label: 'Bubble Tea',
        category: 'Beverages > Bubble Tea',
      },
      {
        label: 'Coffee Substitutes',
        category: 'Beverages > Coffee Substitutes',
      },
      {
        label: 'Meal Replacement & Protein Drinks',
        category:
          'Beverages > Bottled Beverages, Water & Drink Mixes > Meal Replacement & Protein Drinks',
      },
    ],
  },
  {
    label: 'Snacks & Sweets',
    category: 'Snacks & Sweets',
    illustrationImage:
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=640&q=80',
    children: [
      {
        label: 'Snack Foods',
        category: 'Snacks & Sweets > Snack Foods',
        children: [
          {
            label: 'Chips & Crisps',
            category: 'Snacks & Sweets > Snack Foods > Chips & Crisps',
          },
          {
            label: 'Meat Snacks',
            category: 'Snacks & Sweets > Snack Foods > Meat Snacks',
          },
          {
            label: 'Crackers',
            category: 'Snacks & Sweets > Snack Foods > Crackers',
          },
          {
            label: 'Bars',
            category: 'Snacks & Sweets > Snack Foods > Bars',
          },
          {
            label: 'Popcorn',
            category: 'Snacks & Sweets > Snack Foods > Popcorn',
          },
          {
            label: 'Snack & Trail Mixes',
            category: 'Snacks & Sweets > Snack Foods > Snack & Trail Mixes',
          },
        ],
      },
      {
        label: 'Candy & Chocolate',
        category: 'Snacks & Sweets > Candy & Chocolate',
        children: [
          {
            label: 'Hard Candy',
            category: 'Snacks & Sweets > Candy & Chocolate > Hard Candy',
          },
          {
            label: 'Chewing & Bubble Gum',
            category:
              'Snacks & Sweets > Candy & Chocolate > Chewing & Bubble Gum',
          },
          {
            label: 'Gummy Candy',
            category: 'Snacks & Sweets > Candy & Chocolate > Gummy Candy',
          },
          {
            label: 'Suckers & Lollipops',
            category:
              'Snacks & Sweets > Candy & Chocolate > Suckers & Lollipops',
          },
          {
            label: 'Mints',
            category: 'Snacks & Sweets > Candy & Chocolate > Mints',
          },
          {
            label: 'Candy & Chocolate Gifts',
            category:
              'Snacks & Sweets > Candy & Chocolate > Candy & Chocolate Gifts',
          },
        ],
      },
      {
        label: 'Chocolate',
        category: 'Snacks & Sweets > Chocolate',
        children: [
          {
            label: 'Candy & Chocolate Bars',
            category: 'Snacks & Sweets > Chocolate > Candy & Chocolate Bars',
          },
          {
            label: 'Candy & Chocolate Assortments',
            category:
              'Snacks & Sweets > Chocolate > Candy & Chocolate Assortments',
          },
          {
            label: 'Chocolate Truffles',
            category: 'Snacks & Sweets > Chocolate > Chocolate Truffles',
          },
          {
            label: 'Nuts',
            category: 'Snacks & Sweets > Chocolate > Nuts',
          },
          {
            label: 'Fruit',
            category: 'Snacks & Sweets > Chocolate > Fruit',
          },
          {
            label: 'Nut Clusters',
            category: 'Snacks & Sweets > Chocolate > Nut Clusters',
          },
        ],
      },
    ],
  },
]
