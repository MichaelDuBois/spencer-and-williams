'use client'

import { AemDemoCard } from '@/components/landing/AemDemoCard'
import { LandingDemoGrid } from '@/components/landing/LandingDemoGrid'
import { AEM_DEMOS, AEM_DEMOS_HEADING } from '@/verticals/aem-demos'

export const LandingAemDemos = () => (
  <section
    aria-labelledby="aem-demos-heading"
    className="mt-16 border-t border-slate-200 pt-12">
    <h2
      id="aem-demos-heading"
      className="mb-8 text-center text-3xl font-bold text-slate-900">
      {AEM_DEMOS_HEADING}
    </h2>
    <LandingDemoGrid as="ul">
      {AEM_DEMOS.map((demo, index) => (
        <li key={demo.href}>
          <AemDemoCard demo={demo} index={index} />
        </li>
      ))}
    </LandingDemoGrid>
  </section>
)
