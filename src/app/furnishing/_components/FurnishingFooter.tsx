import { furnishingConfig as config } from '@/app/furnishing/config'
import { Footer } from '@/components/footer/Footer'

const sections = [
  {
    title: 'Shop',
    items: ['Living Room', 'Bedroom', 'Home Office', 'Game Room', 'Décor'],
  },
  { title: 'Support', items: ['Contact Us', 'FAQ', 'Shipping & Delivery'] },
  { title: 'Legal', items: ['Privacy Policy', 'Terms of Service'] },
]

export const FurnishingFooter = () => (
  <Footer
    variant="standard"
    name={config.name}
    description="Furniture and home décor designed for everyday living."
    sections={sections}
  />
)
