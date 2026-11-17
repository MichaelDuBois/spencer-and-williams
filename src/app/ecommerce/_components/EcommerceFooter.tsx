import { ecommerceConfig as config } from '@/app/ecommerce/config'
import { Footer } from '@/components/footer/Footer'

const sections = [
  { title: 'Shop', items: ['New Arrivals', 'Best Sellers', 'Sale'] },
  { title: 'Support', items: ['Contact Us', 'FAQ', 'Shipping'] },
  { title: 'Legal', items: ['Privacy Policy', 'Terms of Service'] },
]

export const EcommerceFooter = () => (
  <Footer
    variant="standard"
    name={config.name}
    description="Your one-stop shop for all your needs."
    sections={sections}
  />
)
