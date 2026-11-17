import { b2bWarehouseConfig as config } from '@/app/b2b-warehouse/config'
import { Footer } from '@/components/footer/Footer'

const sections = [
  { title: 'Shop', items: ['Best Sellers', 'Bulk Deals', 'New Arrivals'] },
  { title: 'Support', items: ['Contact Sales', 'Order Status', 'Returns'] },
  { title: 'Legal', items: ['Privacy Policy', 'Terms of Service'] },
]

export const B2BWarehouseFooter = () => (
  <Footer
    variant="standard"
    name={config.name}
    description="Bulk industrial supply for warehouses and jobsites."
    sections={sections}
  />
)
