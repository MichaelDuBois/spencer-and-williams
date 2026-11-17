import { b2bContentConfig as config } from '@/app/b2b-content/config'
import { Footer } from '@/components/footer/Footer'

const sections = [
  {
    title: 'Learn',
    items: ['Documentation', 'Blogs', 'Articles', 'Resources'],
  },
  { title: 'Company', items: ['About', 'Contact', 'Careers'] },
  { title: 'Legal', items: ['Privacy Policy', 'Terms of Service'] },
]

export const B2BContentFooter = () => (
  <Footer
    variant="standard"
    name={config.name}
    description="Documentation, blogs, and resources to help you build better search experiences."
    sections={sections}
  />
)
