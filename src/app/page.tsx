import { LandingHero, VerticalCard } from '@/components/landing/Landing'
import { LandingAemDemos } from '@/components/landing/LandingAemDemos'
import { LandingDemoGrid } from '@/components/landing/LandingDemoGrid'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { verticals } from '@/verticals'

const LandingPage = () => (
  <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
    <LandingHeader />

    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <LandingHero />

        <LandingDemoGrid>
          {verticals.map((vertical, i) => (
            <VerticalCard key={vertical.config.slug} index={i} {...vertical} />
          ))}
        </LandingDemoGrid>

        <LandingAemDemos />
        <LandingFooter />
      </div>
    </div>
  </main>
)

export default LandingPage
