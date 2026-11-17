import { electronicsConfig as config } from '@/app/electronics/config'
import { Footer } from '@/components/footer/Footer'

const sections = [
  { title: 'Shop', items: ['Best Sellers', 'New Arrivals', 'Deals'] },
  { title: 'Support', items: ['Contact Us', 'FAQ', 'Warranty'] },
  { title: 'Legal', items: ['Privacy Policy', 'Terms of Service'] },
]

export const ElectronicsFooter = () => (
  <Footer
    variant="standard"
    name={config.name}
    description="Cutting-edge tech and electronics for every lifestyle."
    sections={sections}
  />
)
