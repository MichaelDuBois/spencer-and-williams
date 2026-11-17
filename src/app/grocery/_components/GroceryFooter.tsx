import { groceryConfig as config } from '@/app/grocery/config'
import { Footer } from '@/components/footer/Footer'

const sections = [
  { title: 'Shop', items: ['Produce', 'Dairy & Eggs', 'Bakery', 'Pantry'] },
  { title: 'Support', items: ['Contact Us', 'FAQ', 'Delivery Info'] },
  { title: 'Legal', items: ['Privacy Policy', 'Terms of Service'] },
]

export const GroceryFooter = () => (
  <Footer
    variant="standard"
    name={config.name}
    description="Fresh groceries delivered to your door."
    sections={sections}
  />
)
