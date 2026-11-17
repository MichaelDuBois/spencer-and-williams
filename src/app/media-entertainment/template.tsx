'use client'

import { PageTransitionTemplate } from '@/components/layout/PageTransitionTemplate'

const Template = ({ children }: { children: React.ReactNode }) => (
  <PageTransitionTemplate>{children}</PageTransitionTemplate>
)

export default Template
