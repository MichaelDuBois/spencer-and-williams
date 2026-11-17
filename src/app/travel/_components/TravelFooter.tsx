import { travelConfig as config } from '@/app/travel/config'
import { Footer } from '@/components/footer/Footer'

const sections = [
  { title: 'Explore', items: ['Articles', 'Podcasts', 'Activities'] },
  { title: 'Destinations', items: ['Europe', 'Asia', 'Americas', 'Africa'] },
  { title: 'Help', items: ['Contact', 'About', 'FAQ'] },
]

export const TravelFooter = () => (
  <Footer
    variant="standard"
    name={config.name}
    description="Inspiring journeys through articles, podcasts, and travel guides."
    sections={sections}
  />
)
