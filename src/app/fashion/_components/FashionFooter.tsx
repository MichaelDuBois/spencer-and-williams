import { fashionConfig as config } from '@/app/fashion/config'
import { Footer } from '@/components/footer/Footer'

const sections = [
  {
    title: 'Discover',
    items: ['New Arrivals', 'Collections', 'Lookbook', 'Journal'],
  },
  {
    title: 'Information',
    items: ['About', 'Contact', 'Shipping', 'Returns'],
  },
]

export const FashionFooter = () => (
  <Footer
    variant="editorial"
    name={config.name}
    description="Curated collections for the modern individual. Timeless pieces that transcend seasons."
    sections={sections}
  />
)
